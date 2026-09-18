<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\LinkedHouseholdMemberProfileSynchronizer;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Admin edit of ONE non-head household-member row.
 *
 * Unlinked rows own their personal details and remain fully editable. Linked
 * rows use the beneficiary profile as their personal-data authority, so this
 * action accepts only household-specific relationship/verification changes for
 * them and rewrites their mirrored fields from the profile.
 *
 * Auditing is automatic via HouseholdMember's LogsActivity trait (logOnlyDirty).
 */
class UpdateHouseholdMemberAction
{
    public function __construct(
        private readonly LinkedHouseholdMemberProfileSynchronizer $profileSynchronizer,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
    ) {}

    public function execute(UpdateHouseholdMemberDto $dto): HouseholdMember
    {
        return DB::transaction(function () use ($dto) {
            $this->lockMunicipality->execute($dto->municipalId);
            $member = HouseholdMember::query()
                ->with('household')
                ->whereKey($dto->memberId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($member, $dto->municipalId);

            // The head row is a mirror of the beneficiary — never editable here.
            if ($member->relationship === Relationship::Head->value) {
                throw new \DomainException(
                    'The head of the household is edited from the beneficiary profile, not the roster.',
                );
            }

            // 'head' is server-managed (one per household). Reject any attempt to
            // promote a roster row to head through this path.
            if ($dto->relationship === Relationship::Head->value) {
                throw new \DomainException(
                    'A household member cannot be set as the head. The head is the registered beneficiary.',
                );
            }

            if ($member->beneficiary_id !== null) {
                return $this->updateLinkedMember($member, $dto);
            }

            $materialIdentityChanged = $member->first_name !== $dto->firstName
                || $member->last_name !== $dto->lastName
                || $member->middle_name !== $dto->middleName
                || $member->suffix !== $dto->suffix
                || $member->birth_date?->toDateString() !== $dto->birthDate
                || $member->sex !== $dto->sex
                || $member->relationship !== $dto->relationship;

            $isVerifiedDependent = $member->is_verified_dependent && $materialIdentityChanged
                ? false
                : ($member->is_verified_dependent || $dto->isVerifiedDependent);

            $member->update([
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'relationship' => $dto->relationship,
                'birth_date' => $dto->birthDate,
                'sex' => $dto->sex,
                'civil_status' => $dto->civilStatus,
                'educational_attainment' => $dto->educationalAttainment,
                'occupation' => $dto->occupation,
                'monthly_income' => $dto->monthlyIncome ?? 0,
                'religion_id' => $dto->religionId,
                'is_verified_dependent' => $isVerifiedDependent,
            ]);

            return $member->fresh();
        }, attempts: 3);
    }

    private function updateLinkedMember(
        HouseholdMember $member,
        UpdateHouseholdMemberDto $dto,
    ): HouseholdMember {
        if (! $member->is_active) {
            throw new \DomainException(
                'A moved-out linked household row is historical and cannot be edited. Update the beneficiary profile or restore the member first.',
            );
        }

        $beneficiary = Beneficiary::query()
            ->whereKey($member->beneficiary_id)
            ->lockForUpdate()
            ->firstOrFail();

        if ($beneficiary->municipal_id !== $dto->municipalId) {
            throw new AuthorizationException(
                'The linked beneficiary profile belongs to another municipality.',
            );
        }

        if ($beneficiary->household_id !== $member->household_id) {
            throw new \DomainException(
                'The linked beneficiary is assigned to another primary household. Use Transfer/Reassign Household to correct the residence.',
            );
        }

        $relationshipChanged = $member->relationship !== $dto->relationship;
        $member->update([
            'relationship' => $dto->relationship,
            'is_verified_dependent' => $member->is_verified_dependent && $relationshipChanged
                ? false
                : ($member->is_verified_dependent || $dto->isVerifiedDependent),
        ]);

        $this->profileSynchronizer->sync($member, $beneficiary);

        return $member->fresh();
    }

    private function ensureTenantMatch(HouseholdMember $member, string $municipalId): void
    {
        if ($member->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only manage household members from your own municipality.',
            );
        }
    }
}
