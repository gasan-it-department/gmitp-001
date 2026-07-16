<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIntakeSheetData;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Assemble every piece of data needed to render a beneficiary's intake
 * sheet — the formal MSWD document used during interviews and filed in
 * the citizen's permanent case folder.
 *
 * ── Read use case, not a write use case ───────────────────────────────
 * Unlike Approve / Reject / Release, this action does NOT mutate state,
 * lock rows, or open a transaction. It only reads + assembles. The
 * "use case" framing still applies because the data-gathering logic
 * (tenant guard, cross-table joins, computed totals) is real domain
 * work that belongs out of the controller and out of the renderer.
 *
 * ── Why the renderer doesn't do the queries directly ──────────────────
 * Two reasons:
 *   1. The same intake-sheet data might be exported as Excel later
 *      (some MSWD heads want it for filtering). Both PDF and Excel
 *      consume the same DTO, so the queries live once.
 *   2. The intake-sheet contents are a *domain decision* (what counts
 *      as the citizen's official identity record), not a *rendering
 *      decision*. Keeping it in Core means it stays meaningful even
 *      if we swap rendering libraries someday.
 *
 * ── Gates ─────────────────────────────────────────────────────────────
 *   1. Existence — findOrFail on beneficiary
 *   2. Tenant match — beneficiary's household.municipal_id must equal
 *                     the current municipality (prevents cross-tenant
 *                     intake-sheet dumps via ID guessing)
 *
 * No transaction needed — pure read.
 */
class GenerateBeneficiaryIntakeSheetAction
{
    public function execute(
        string $beneficiaryId,
        string $municipalId,
        ?string $municipalityName,
        string $generatedByUserName,
    ): BeneficiaryIntakeSheetData {

        $beneficiary = $this->loadBeneficiary($beneficiaryId);

        $this->ensureTenantMatch($beneficiary, $municipalId);

        $householdMembers = $this->loadHouseholdMembers($beneficiary->household_id);
        $householdTotalIncome = $this->computeHouseholdTotalIncome($householdMembers);

        return new BeneficiaryIntakeSheetData(
            beneficiary: $beneficiary,
            householdMembers: $householdMembers,
            householdTotalMonthlyIncome: $householdTotalIncome,
            municipalityName: $municipalityName,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
            hasIdentityIdFront: $beneficiary->getFirstMedia('identity_id_front') !== null,
            hasIdentityIdBack: $beneficiary->getFirstMedia('identity_id_back') !== null,
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Loaders (each isolates one query so the assemble path reads top-down)
    // ─────────────────────────────────────────────────────────────────────

    private function loadBeneficiary(string $beneficiaryId): Beneficiary
    {
        return Beneficiary::query()
            ->with(['household', 'religion', 'user', 'identityVerifier', 'intakeRejector'])
            ->whereKey($beneficiaryId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Beneficiary not found.');
            });
    }

    private function ensureTenantMatch(Beneficiary $beneficiary, string $municipalId): void
    {
        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate intake sheets for beneficiaries in your own municipality.',
            );
        }
    }

    /**
     * Active members, head first, then the rest in insertion order so
     * the printed sheet reads the way the citizen entered the family.
     */
    private function loadHouseholdMembers(string $householdId): \Illuminate\Support\Collection
    {
        return HouseholdMember::query()
            ->where('household_id', $householdId)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Sum of monthly_income across all active members (the head is
     * included via the self-row pattern so we don't double-count).
     */
    private function computeHouseholdTotalIncome(\Illuminate\Support\Collection $members): float
    {
        return (float) $members->sum(fn($m) => (float) $m->monthly_income);
    }
}
