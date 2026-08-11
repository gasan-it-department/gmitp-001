<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\ChangeHouseholdHeadDto;
use App\Core\ActionCenter\Enums\HeadDepartureDisposition;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ChangeHouseholdHeadAction
{
    public function __construct(
        private readonly EvaluateHouseholdHeadCandidateAction $evaluateCandidate,
    ) {}

    public function execute(ChangeHouseholdHeadDto $dto): Household
    {
        return DB::transaction(function () use ($dto) {
            $household = Household::query()
                ->whereKey($dto->householdId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($household->municipal_id !== $dto->municipalId) {
                throw new AuthorizationException(
                    'You may only manage households from your own municipality.',
                );
            }

            $members = HouseholdMember::query()
                ->with('beneficiary')
                ->where('household_id', $household->id)
                ->lockForUpdate()
                ->get();

            $currentHeads = $members->filter(
                fn (HouseholdMember $member) => $member->is_active
                    && $member->relationship === Relationship::Head->value,
            );

            if ($currentHeads->count() > 1) {
                throw new \DomainException(
                    'This household already has multiple active heads. Resolve the roster inconsistency before continuing.',
                );
            }

            /** @var HouseholdMember|null $currentHead */
            $currentHead = $currentHeads->first();

            if ($currentHead === null && $dto->successorMemberId === null) {
                throw new \DomainException('This household is already on hold. Select an eligible new head.');
            }

            if ($currentHead !== null && $dto->currentHeadDisposition === null) {
                throw new \DomainException('Choose what happened to the current head of household.');
            }

            if ($currentHead !== null
                && $dto->currentHeadDisposition === HeadDepartureDisposition::RemainsMember
                && $dto->successorMemberId === null) {
                throw new \DomainException(
                    'Select a new head when the current head remains in the household.',
                );
            }

            if ($currentHead !== null) {
                $this->transitionCurrentHead($currentHead, $dto);
            }

            $successor = null;
            if ($dto->successorMemberId !== null) {
                $successor = $members->firstWhere('id', $dto->successorMemberId);

                if ($successor === null || $successor->id === $currentHead?->id) {
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

                $ineligibilityReason = $this->evaluateCandidate->execute($successor, $household);

                if ($ineligibilityReason !== null) {
                    throw new \DomainException($ineligibilityReason);
                }

                $successor->update([
                    'relationship' => Relationship::Head->value,
                    'is_active' => true,
                    'is_verified_dependent' => false,
                ]);
            }

            activity('household-head')
                ->performedOn($currentHead ?? $successor)
                ->causedBy(User::find($dto->actingAdminId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'former_head_member_id' => $currentHead?->id,
                    'former_head_beneficiary_id' => $currentHead?->beneficiary_id,
                    'former_head_disposition' => $dto->currentHeadDisposition?->value,
                    'former_head_relationship' => $dto->formerHeadRelationship,
                    'successor_member_id' => $successor?->id,
                    'successor_beneficiary_id' => $successor?->beneficiary_id,
                    'household_on_hold' => $successor === null,
                    'reason' => $dto->reason,
                ])
                ->log($successor === null
                    ? 'Placed household on hold without an active head'
                    : 'Changed head of household');

            return $household->fresh(['activeHead.beneficiary', 'members.beneficiary']);
        }, attempts: 3);
    }

    private function transitionCurrentHead(
        HouseholdMember $currentHead,
        ChangeHouseholdHeadDto $dto,
    ): void {
        $disposition = $dto->currentHeadDisposition;

        if ($disposition === HeadDepartureDisposition::RemainsMember) {
            if ($dto->formerHeadRelationship === null
                || $dto->formerHeadRelationship === Relationship::Head->value) {
                throw new \DomainException(
                    'Choose the former head\'s relationship to the new head.',
                );
            }

            $currentHead->update([
                'relationship' => $dto->formerHeadRelationship,
                'is_active' => true,
                'is_verified_dependent' => true,
            ]);

            return;
        }

        $currentHead->update([
            'is_active' => false,
            'is_verified_dependent' => false,
        ]);

        if ($currentHead->beneficiary_id !== null && in_array($disposition, [
            HeadDepartureDisposition::MovedOut,
            HeadDepartureDisposition::Deceased,
            HeadDepartureDisposition::Inactive,
        ], true)) {
            Beneficiary::query()
                ->whereKey($currentHead->beneficiary_id)
                ->lockForUpdate()
                ->update(['is_active' => false]);
        }
    }
}
