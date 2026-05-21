<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\HouseholdMember;

/**
 * Persist one ac_household_members row.
 *
 * Intentionally does NOT open its own DB transaction. Callers decide the
 * transaction boundary so the action composes cleanly inside a larger
 * unit-of-work — for example:
 *
 *   - CreateBeneficiaryProfileAction wraps a single transaction around
 *     "create beneficiary + fan out N household members" so a partial
 *     write is impossible.
 *   - StoreInlineHouseholdMemberController calls this directly; if it
 *     wants atomicity it opens its own transaction.
 *
 * The HARD active-member cap (per-household limit) lives here, not in the
 * FormRequest. The form validates payload shape; the action enforces
 * business rules.
 *
 * Spatie/laravel-activitylog writes the audit row automatically because
 * HouseholdMember has the LogsActivity trait — no manual activity() call.
 */
class StoreHouseholdMemberAction
{
    /**
     * Maximum active members per household. Above this, encoding moves to
     * the MSWD office (in-person walk-in) where a social worker can verify
     * the unusually large composition during intake.
     *
     * Sized to comfortably hold extended-family households (P99.9 in PSA
     * Census data is under 20) while preventing DoS-via-bulk-add.
     */
    public const ACTIVE_MEMBER_HARD_LIMIT = 20;

    public function execute(StoreHouseholdMemberDto $dto, ?string $beneficiaryId = null): HouseholdMember
    {
        $isHead = $dto->relationship === Relationship::Head->value;

        // ── Head-uniqueness guard ────────────────────────────────────────────
        // Each household has exactly one Head — the self-row created by
        // CreateBeneficiaryProfileAction at registration. Reject any attempt
        // to write a second Head row (would orphan beneficiary linkage).
        if ($isHead) {
            $existingHead = HouseholdMember::query()
                ->where('household_id', $dto->householdId)
                ->where('relationship', Relationship::Head->value)
                ->exists();

            if ($existingHead) {
                throw new \DomainException(
                    'This household already has a Head — only one is permitted.',
                );
            }
        }

        // ── Active-member hard limit ─────────────────────────────────────────
        // Counts only ACTIVE rows so deactivated (moved-out) history doesn't
        // push a real household past the cap.
        $activeCount = HouseholdMember::query()
            ->where('household_id', $dto->householdId)
            ->where('is_active', true)
            ->count();

        if ($activeCount >= self::ACTIVE_MEMBER_HARD_LIMIT) {
            throw new \DomainException(
                sprintf(
                    'This household already has %d active members. ' .
                    'If this is accurate, please visit the MSWD office to add more.',
                    self::ACTIVE_MEMBER_HARD_LIMIT,
                ),
            );
        }

        return HouseholdMember::create([
            'household_id'           => $dto->householdId,
            'first_name'             => $dto->firstName,
            'last_name'              => $dto->lastName,
            'middle_name'            => $dto->middleName,
            'suffix'                 => $dto->suffix,
            'relationship'           => $dto->relationship,
            'birth_date'             => $dto->birthDate,
            'sex'                    => $dto->sex,
            'civil_status'           => $dto->civilStatus,
            'educational_attainment' => $dto->educationalAttainment,
            'occupation'             => $dto->occupation,
            'monthly_income'         => $dto->monthlyIncome ?? 0,
            'religion_id'            => $dto->religionId,
            'is_active'              => true,
            // beneficiary_id is set ONLY for the Head row at registration time
            // (or later via identity reconciliation when a member registers
            // their own portal account).
            'beneficiary_id'         => $beneficiaryId,
        ]);
    }
}
