<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\UpdateBeneficiaryProfileDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class UpdateBeneficiaryProfileAction
{
    public function execute(UpdateBeneficiaryProfileDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($beneficiary->municipal_id !== $dto->municipalId) {
                throw new AuthorizationException(
                    'You may only edit beneficiaries from your own municipality.',
                );
            }

            $identityChanged = $beneficiary->first_name !== $dto->firstName
                || $beneficiary->last_name !== $dto->lastName
                || $beneficiary->middle_name !== $dto->middleName
                || $beneficiary->suffix !== $dto->suffix
                || $beneficiary->birth_date?->toDateString() !== $dto->birthDate
                || $beneficiary->sex !== $dto->sex;

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
                'identity_verified_at' => $identityChanged
                    ? null
                    : $beneficiary->identity_verified_at,
                'identity_verified_by_user_id' => $identityChanged
                    ? null
                    : $beneficiary->identity_verified_by_user_id,
            ]);

            $primaryRosterRow = HouseholdMember::query()
                ->where('household_id', $beneficiary->household_id)
                ->where('beneficiary_id', $beneficiary->id)
                ->lockForUpdate()
                ->first();

            if ($primaryRosterRow !== null) {
                $primaryRosterRow->update([
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
                    'is_verified_dependent' => $identityChanged
                        ? false
                        : $primaryRosterRow->is_verified_dependent,
                ]);
            }

            activity('beneficiary')
                ->performedOn($beneficiary)
                ->causedBy(User::find($dto->actingAdminId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'identity_verification_reset' => $identityChanged,
                ])
                ->log('Updated beneficiary profile');

            return $beneficiary->fresh(['household', 'identityVerifier']);
        }, attempts: 3);
    }
}
