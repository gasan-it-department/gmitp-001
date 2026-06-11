<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Admin edit of ONE non-head household-member row.
 *
 * The head row is intentionally off-limits here: it mirrors the beneficiary and
 * is kept in sync by UpdateBeneficiaryProfileAction. Editing it directly would
 * let the mirror drift, so this action rejects it and points the admin at the
 * profile editor.
 *
 * Auditing is automatic via HouseholdMember's LogsActivity trait (logOnlyDirty).
 */
class UpdateHouseholdMemberAction
{
    public function execute(UpdateHouseholdMemberDto $dto): HouseholdMember
    {
        return DB::transaction(function () use ($dto) {
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

            $materialIdentityChanged = $member->first_name !== $dto->firstName
                || $member->last_name !== $dto->lastName
                || $member->middle_name !== $dto->middleName
                || $member->suffix !== $dto->suffix
                || $member->birth_date?->toDateString() !== $dto->birthDate
                || $member->sex !== $dto->sex
                || $member->relationship !== $dto->relationship;

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
                'is_verified_dependent' => $materialIdentityChanged
                    ? false
                    : ($dto->isVerifiedDependent || $member->is_verified_dependent),
            ]);

            return $member->fresh();
        }, attempts: 3);
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
