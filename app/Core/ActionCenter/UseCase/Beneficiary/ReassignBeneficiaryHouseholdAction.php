<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ReassignBeneficiaryHouseholdDto;
use App\Core\ActionCenter\Enums\HouseholdReassignmentOperation;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ReassignBeneficiaryHouseholdAction
{
    public function __construct(
        private readonly \App\Core\ActionCenter\UseCase\Household\EvaluateHouseholdHeadCandidateAction $evaluateCandidate,
        private readonly \App\Core\ActionCenter\UseCase\Household\CreateHouseholdAction $createHousehold,
        private readonly EnsureBeneficiaryHasNoOpenAssistanceRequestAction $ensureNoOpenAssistanceRequest,
    ) {}

    public function execute(ReassignBeneficiaryHouseholdDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {
            $beneficiary = Beneficiary::query()
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($beneficiary->municipal_id !== $dto->municipalId) {
                throw new AuthorizationException(
                    'You may only manage beneficiaries from your own municipality.',
                );
            }

            $this->ensureNoOpenAssistanceRequest->execute($beneficiary->id);

            // We allow reassigning inactive (moved-out) beneficiaries, but we cannot move-out an already inactive one.
            if (! $beneficiary->is_active && $dto->operation === HouseholdReassignmentOperation::MoveOut) {
                throw new \DomainException('Cannot move out an already inactive/suspended beneficiary.');
            }

            $sourceHousehold = Household::query()
                ->whereKey($beneficiary->household_id)
                ->lockForUpdate()
                ->firstOrFail();

            // Find their most recent roster row in this household (active or not)
            $sourceMember = HouseholdMember::query()
                ->where('household_id', $sourceHousehold->id)
                ->where('beneficiary_id', $beneficiary->id)
                ->orderByDesc('id')
                ->lockForUpdate()
                ->first();

            if ($sourceMember === null) {
                throw new \DomainException('The beneficiary does not have a roster row in their current household.');
            }

            if ($beneficiary->is_active && ! $sourceMember->is_active) {
                throw new \DomainException('The beneficiary is marked active but lacks an active household roster row. Data is inconsistent.');
            }

            if ($dto->operation === HouseholdReassignmentOperation::MoveOut) {
                return $this->processMoveOut($beneficiary, $sourceMember, $dto);
            }

            return $this->processReassignment($beneficiary, $sourceHousehold, $sourceMember, $dto);
        }, attempts: 3);
    }

    private function processMoveOut(
        Beneficiary $beneficiary,
        HouseholdMember $sourceMember,
        ReassignBeneficiaryHouseholdDto $dto,
    ): Beneficiary {
        if ($sourceMember->relationship === Relationship::Head->value) {
            $this->processHeadCascade($sourceMember, $beneficiary->household_id, $dto);
        }

        $verificationBefore = $sourceMember->is_verified_dependent;
        
        if ($beneficiary->is_active) {
            $sourceMember->update(['is_active' => false]);
            $beneficiary->update(['is_active' => false]);
        }

        $this->logActivity($beneficiary, clone $sourceMember, null, null, $verificationBefore, null, $dto);

        return $beneficiary->fresh();
    }

    private function processReassignment(
        Beneficiary $beneficiary,
        Household $sourceHousehold,
        HouseholdMember $sourceMember,
        ReassignBeneficiaryHouseholdDto $dto,
    ): Beneficiary {
        // Only cascade head if they are actually active right now.
        // If they were already moved out (inactive), this was handled previously.
        if ($beneficiary->is_active && $sourceMember->relationship === Relationship::Head->value) {
            $this->processHeadCascade($sourceMember, $sourceHousehold->id, $dto);
        }

        $destinationHousehold = null;

        if ($dto->destinationHouseholdId !== null) {
            $destinationHousehold = Household::query()
                ->whereKey($dto->destinationHouseholdId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($destinationHousehold->municipal_id !== $dto->municipalId) {
                throw new \DomainException('The destination household must be in the same municipality.');
            }

            if ($destinationHousehold->id === $sourceHousehold->id) {
                throw new \DomainException('The destination household must be different from the current household.');
            }
        } else {
            if (empty($dto->newHouseholdBarangay)) {
                throw new \DomainException('A barangay is required when creating a provisional household.');
            }

            $destinationHousehold = $this->createHousehold->execute(
                $dto->municipalId,
                $dto->newHouseholdBarangay,
                null,
                $dto->newHouseholdStreet,
            );
        }

        $activeDuplicate = HouseholdMember::query()
            ->where('household_id', $destinationHousehold->id)
            ->where('beneficiary_id', $beneficiary->id)
            ->where('is_active', true)
            ->exists();

        if ($activeDuplicate) {
            throw new \DomainException('The beneficiary is already active in the destination household.');
        }

        $destinationMember = null;
        if ($dto->destinationMemberId !== null) {
            $destinationMember = HouseholdMember::query()
                ->whereKey($dto->destinationMemberId)
                ->where('household_id', $destinationHousehold->id)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $destinationMember->is_active) {
                throw new \DomainException('The selected destination roster row is not active.');
            }

            if ($destinationMember->beneficiary_id !== null && $destinationMember->beneficiary_id !== $beneficiary->id) {
                throw new \DomainException('The destination roster row is already linked to another beneficiary.');
            }

            $destinationMember->update([
                'beneficiary_id' => $beneficiary->id,
                'is_verified_dependent' => $dto->verifyAtDestination,
            ]);
        } else {
            $existingHead = HouseholdMember::query()
                ->where('household_id', $destinationHousehold->id)
                ->where('relationship', Relationship::Head->value)
                ->where('is_active', true)
                ->exists();

            $newRelationship = $existingHead ? $sourceMember->relationship : Relationship::Head->value;
            if ($newRelationship === Relationship::Head->value && $existingHead) {
                $newRelationship = Relationship::Sibling->value;
            }

            $destinationMember = HouseholdMember::create([
                'household_id' => $destinationHousehold->id,
                'beneficiary_id' => $beneficiary->id,
                'first_name' => $beneficiary->first_name,
                'middle_name' => $beneficiary->middle_name,
                'last_name' => $beneficiary->last_name,
                'suffix' => $beneficiary->suffix,
                'birth_date' => $beneficiary->birth_date,
                'sex' => $beneficiary->sex,
                'civil_status' => $beneficiary->civil_status?->value,
                'educational_attainment' => $beneficiary->educational_attainment,
                'occupation' => $beneficiary->occupation,
                'monthly_income' => $beneficiary->monthly_income ?? 0,
                'religion_id' => $beneficiary->religion_id,
                'relationship' => $newRelationship,
                'is_active' => true,
                'is_verified_dependent' => $newRelationship === Relationship::Head->value ? false : $dto->verifyAtDestination,
            ]);
        }

        $verificationBefore = $sourceMember->is_verified_dependent;
        $verificationAfter = $destinationMember->is_verified_dependent;

        if ($beneficiary->is_active) {
            $sourceMember->update(['is_active' => false]);
        }

        $beneficiary->update([
            'household_id' => $destinationHousehold->id,
            'is_active' => true,
        ]);

        $this->logActivity(
            $beneficiary, 
            $sourceMember, 
            $destinationMember, 
            $destinationHousehold, 
            $verificationBefore, 
            $verificationAfter, 
            $dto
        );

        return $beneficiary->fresh();
    }

    private function processHeadCascade(
        HouseholdMember $sourceMember,
        string $sourceHouseholdId,
        ReassignBeneficiaryHouseholdDto $dto,
    ): void {
        if (! $dto->placeHouseholdOnHold && $dto->successorMemberId === null) {
            throw new \DomainException('You must appoint a new head or place the household on hold.');
        }

        if ($dto->placeHouseholdOnHold) {
            if ($dto->successorMemberId !== null) {
                throw new \DomainException('Cannot appoint a successor when placing the household on hold.');
            }
            return; // Leaves household with no active head
        }

        $successor = HouseholdMember::query()
            ->where('household_id', $sourceHouseholdId)
            ->whereKey($dto->successorMemberId)
            ->lockForUpdate()
            ->first();

        if ($successor === null || $successor->id === $sourceMember->id) {
            throw new \DomainException('Select a different active household member as the new head.');
        }

        if ($successor->beneficiary_id !== null) {
            $successor->setRelation(
                'beneficiary',
                Beneficiary::query()
                    ->whereKey($successor->beneficiary_id)
                    ->lockForUpdate()
                    ->first(),
            );
        }

        $sourceHousehold = Household::find($sourceHouseholdId);
        $ineligibilityReason = $this->evaluateCandidate->execute($successor, $sourceHousehold);

        if ($ineligibilityReason !== null) {
            throw new \DomainException($ineligibilityReason);
        }

        $successor->update([
            'relationship' => Relationship::Head->value,
            'is_verified_dependent' => false,
        ]);
    }

    private function logActivity(
        Beneficiary $beneficiary,
        HouseholdMember $sourceMember,
        ?HouseholdMember $destinationMember,
        ?Household $destinationHousehold,
        bool $verificationBefore,
        ?bool $verificationAfter,
        ReassignBeneficiaryHouseholdDto $dto,
    ): void {
        activity('household-reassignment')
            ->performedOn($beneficiary)
            ->causedBy(User::find($dto->actingAdminId))
            ->withProperties([
                'operation' => $dto->operation->value,
                'reason' => $dto->reason,
                'previous_household_id' => $sourceMember->household_id,
                'new_household_id' => $destinationHousehold?->id,
                'previous_member_id' => $sourceMember->id,
                'new_member_id' => $destinationMember?->id,
                'verification_before' => $verificationBefore,
                'verification_after' => $verificationAfter,
            ])
            ->log($dto->operation->label() . ' applied');
    }
}
