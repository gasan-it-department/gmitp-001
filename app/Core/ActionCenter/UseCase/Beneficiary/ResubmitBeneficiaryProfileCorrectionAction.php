<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ResubmitBeneficiaryProfileCorrectionDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Core\Users\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ResubmitBeneficiaryProfileCorrectionAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeHouseholdMember,
    ) {}

    public function execute(ResubmitBeneficiaryProfileCorrectionDto $dto): Beneficiary
    {
        $beneficiary = DB::transaction(function () use ($dto) {
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->where('user_id', $dto->userId)
                ->where('municipal_id', $dto->municipalId)
                ->lockForUpdate()
                ->first();

            if ($beneficiary === null) {
                throw new \DomainException('No beneficiary profile is available for correction.');
            }

            $this->guardCorrectionAllowed($beneficiary);

            $household = $beneficiary->household()
                ->lockForUpdate()
                ->first();

            if ($household === null) {
                throw new \DomainException('This beneficiary profile has no household to correct.');
            }

            $household->update([
                'barangay' => $dto->barangay,
                'barangay_psgc_code' => $dto->barangayCode,
                'street' => $dto->street,
            ]);

            $beneficiary->update([
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'sex' => $dto->sex,
                'birth_date' => $dto->birthDate,
                'religion_id' => $dto->religionId,
                'educational_attainment' => $dto->educationalAttainment,
                'civil_status' => $dto->civilStatus,
                'occupation' => $dto->occupation,
                'monthly_income' => $dto->monthlyIncome,
                'contact_phone' => $dto->contactPhone,
                'identity_verified_at' => null,
                'identity_verified_by_user_id' => null,
                'intake_rejected_at' => null,
                'intake_rejected_by_user_id' => null,
                'intake_rejection_reason' => null,
            ]);

            $this->syncPrimaryHeadRow($beneficiary->fresh(), $dto);
            $this->replaceProvisionalDependents($beneficiary->household_id, $dto);

            activity('beneficiary')
                ->performedOn($beneficiary)
                ->causedBy(User::find($dto->userId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'reopened_for_review' => true,
                ])
                ->log('Resubmitted beneficiary profile correction');

            return $beneficiary->fresh(['household', 'media']);
        }, attempts: 3);

        $this->storeIdentityDocuments($beneficiary, $dto);

        return $beneficiary->fresh(['household', 'media']);
    }

    private function guardCorrectionAllowed(Beneficiary $beneficiary): void
    {
        if ($beneficiary->merged_into_beneficiary_id !== null) {
            throw new \DomainException('This profile has already been merged into another beneficiary record.');
        }

        if (! $beneficiary->is_active) {
            throw new \DomainException('Inactive beneficiary profiles cannot be resubmitted from the portal.');
        }

        if ($beneficiary->identity_verified_at !== null) {
            throw new \DomainException('This beneficiary profile has already been verified.');
        }

        if ($beneficiary->intake_rejected_at === null) {
            throw new \DomainException('Only rejected beneficiary profiles can submit a correction.');
        }
    }

    private function syncPrimaryHeadRow(
        Beneficiary $beneficiary,
        ResubmitBeneficiaryProfileCorrectionDto $dto,
    ): void {
        HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->where('beneficiary_id', $beneficiary->id)
            ->where('relationship', Relationship::Head->value)
            ->lockForUpdate()
            ->first()
            ?->update([
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'sex' => $dto->sex,
                'birth_date' => $dto->birthDate,
                'religion_id' => $dto->religionId,
                'educational_attainment' => $dto->educationalAttainment,
                'civil_status' => $dto->civilStatus,
                'occupation' => $dto->occupation,
                'monthly_income' => $dto->monthlyIncome,
                'is_verified_dependent' => false,
            ]);
    }

    private function replaceProvisionalDependents(
        string $householdId,
        ResubmitBeneficiaryProfileCorrectionDto $dto,
    ): void {
        HouseholdMember::query()
            ->where('household_id', $householdId)
            ->whereNull('beneficiary_id')
            ->where('is_verified_dependent', false)
            ->where(function ($query) {
                $query
                    ->whereNull('relationship')
                    ->orWhere('relationship', '!=', Relationship::Head->value);
            })
            ->lockForUpdate()
            ->get()
            ->each
            ->delete();

        foreach ($dto->householdMembers as $memberData) {
            $this->storeHouseholdMember->execute(
                StoreHouseholdMemberDto::fromArray($memberData, $householdId),
                isVerifiedDependent: false,
            );
        }
    }

    private function storeIdentityDocuments(
        Beneficiary $beneficiary,
        ResubmitBeneficiaryProfileCorrectionDto $dto,
    ): void {
        if ($dto->identityIdFront instanceof UploadedFile) {
            $beneficiary
                ->addMedia($dto->identityIdFront)
                ->usingFileName($this->identityDocumentFileName($beneficiary, 'front', $dto->identityIdFront))
                ->toMediaCollection('identity_id_front');
        }

        if ($dto->identityIdBack instanceof UploadedFile) {
            $beneficiary
                ->addMedia($dto->identityIdBack)
                ->usingFileName($this->identityDocumentFileName($beneficiary, 'back', $dto->identityIdBack))
                ->toMediaCollection('identity_id_back');
        }
    }

    private function identityDocumentFileName(Beneficiary $beneficiary, string $side, UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->guessExtension() ?: 'jpg');

        return 'identity-id-' . $side . '-' . $beneficiary->getKey() . '.' . $extension;
    }
}
