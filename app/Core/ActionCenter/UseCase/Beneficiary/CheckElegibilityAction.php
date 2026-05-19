<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\EligibilityResult;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Decide whether a beneficiary may file a new request for a given assistance type.
 *
 * Business rule (MSWD Gasan):
 *   When a beneficiary is granted ANY assistance with a per_request cooldown
 *   (e.g. Educational = 12 months), they are locked out of ALL other assistance
 *   types for the duration of that cooldown — not just the type they received.
 *   This prevents stacking benefits across programs.
 *
 * Three blocking conditions, evaluated in this order:
 *
 *   1. Permanent block (per-type) — a row exists in ac_beneficiary_cooldowns
 *      with cooldown_expires_at IS NULL FOR THIS TYPE. one_time programs
 *      (Burial) consume once per beneficiary/household. Stays type-specific
 *      because a Burial approval shouldn't permanently block Medical.
 *
 *   2. Cross-program cooldown — any row exists for this beneficiary (or
 *      their household, depending on the originating type's scope) with
 *      cooldown_expires_at > NOW(). Blocks every assistance type until the
 *      longest-running cooldown expires.
 *
 *   3. Cross-program in-flight — the citizen has a pending OR under_review
 *      request for ANY type. Blocks every card on the portal until that
 *      request is resolved (approved → cooldown takes over; cancelled or
 *      rejected → immediately eligible again).
 *
 * Use the bulk path (executeBatch) on the portal card grid so we hit the
 * database only twice regardless of how many types are rendered.
 */
class CheckElegibilityAction
{
    /**
     * Statuses that count as "open" — the citizen has something in queue.
     * Approved/released/rejected/cancelled are all terminal for this guard.
     */
    private const IN_FLIGHT_STATUSES = ['pending', 'under_review'];

    /**
     * Single-type evaluation. Two queries total (one for cooldowns, one for
     * in-flight requests). Use this in the Apply controller and inside
     * StoreAssistanceRequestAction.
     */
    public function execute(Beneficiary $beneficiary, AssistanceType $type): EligibilityResult
    {
        // Rule 1 — permanent block for THIS type (one_time Burial-style)
        if ($this->hasPermanentBlock($beneficiary, $type)) {
            return EligibilityResult::permanentBlock();
        }

        // Rule 2 — cross-program active cooldown
        if ($cooldown = $this->findLongestActiveCooldown($beneficiary)) {
            return EligibilityResult::onCooldown($cooldown->cooldown_expires_at);
        }

        // Rule 3 — cross-program in-flight request
        if ($this->hasAnyInFlightRequest($beneficiary)) {
            return EligibilityResult::inFlightRequest();
        }

        return EligibilityResult::eligible();
    }

    /**
     * Bulk-evaluate eligibility for a list of assistance types.
     *
     * Same rules as execute(), but uses EXACTLY TWO queries regardless of how
     * many types are passed in — designed for the portal card grid where we
     * render every active assistance type and need per-card disabled state
     * without N+1 lookups.
     *
     * @param  Collection<int, AssistanceType>  $types
     * @return array<string, EligibilityResult>  keyed by assistance_type_id
     */
    public function executeBatch(Beneficiary $beneficiary, Collection $types): array
    {
        if ($types->isEmpty()) {
            return [];
        }

        // Query 1 — every cooldown row that touches this beneficiary or their
        // household. We don't filter by assistance_type_id here because the
        // cross-program rule means cooldowns from OTHER types still block.
        $cooldowns = BeneficiaryCooldown::query()
            ->where(function (Builder $q) use ($beneficiary) {
                $q->where('beneficiary_id', $beneficiary->id);
                if ($beneficiary->household_id !== null) {
                    $q->orWhere('household_id', $beneficiary->household_id);
                }
            })
            ->get();

        $permanentBlockedTypeIds = $cooldowns
            ->whereNull('cooldown_expires_at')
            ->pluck('assistance_type_id')
            ->all();

        $longestActiveCooldown = $cooldowns
            ->filter(fn (BeneficiaryCooldown $c) => $c->cooldown_expires_at !== null
                && $c->cooldown_expires_at->isFuture())
            ->sortByDesc('cooldown_expires_at')
            ->first();

        // Query 2 — does this beneficiary have ANY in-flight request right now?
        // Cross-program: an open Medical request blocks the Educational card too.
        $hasInFlight = AssistanceRequest::query()
            ->where('beneficiary_id', $beneficiary->id)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->exists();

        // Per-type verdicts, applying the rule precedence in memory.
        $results = [];
        foreach ($types as $type) {
            if (in_array($type->id, $permanentBlockedTypeIds, true)) {
                $results[$type->id] = EligibilityResult::permanentBlock();
                continue;
            }

            if ($longestActiveCooldown !== null) {
                $results[$type->id] = EligibilityResult::onCooldown(
                    $longestActiveCooldown->cooldown_expires_at
                );
                continue;
            }

            if ($hasInFlight) {
                $results[$type->id] = EligibilityResult::inFlightRequest();
                continue;
            }

            $results[$type->id] = EligibilityResult::eligible();
        }

        return $results;
    }

    private function hasPermanentBlock(Beneficiary $beneficiary, AssistanceType $type): bool
    {
        // For one_time blocks we DO honor the originating type's scope —
        // a Burial approval shouldn't block another family member's Medical.
        return $this->scopedCooldownQuery($beneficiary, $type)
            ->whereNull('cooldown_expires_at')
            ->exists();
    }

    /**
     * The active cooldown with the latest expiry — that's the "real" wait the
     * citizen has to serve, even if it came from a different program.
     *
     * No assistance_type_id filter: this is the cross-program lockout query.
     */
    private function findLongestActiveCooldown(Beneficiary $beneficiary): ?BeneficiaryCooldown
    {
        return BeneficiaryCooldown::query()
            ->where(function (Builder $q) use ($beneficiary) {
                $q->where('beneficiary_id', $beneficiary->id);
                if ($beneficiary->household_id !== null) {
                    $q->orWhere('household_id', $beneficiary->household_id);
                }
            })
            ->whereNotNull('cooldown_expires_at')
            ->where('cooldown_expires_at', '>', now())
            ->orderByDesc('cooldown_expires_at')
            ->first();
    }

    private function hasAnyInFlightRequest(Beneficiary $beneficiary): bool
    {
        return AssistanceRequest::query()
            ->where('beneficiary_id', $beneficiary->id)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->exists();
    }

    /**
     * Scope-aware query used ONLY for the permanent (one_time) block check.
     *
     *   per_beneficiary → only this individual's history matters.
     *   per_household   → any household member's prior approval blocks the
     *                     whole household for THIS type (E.O. pattern).
     */
    private function scopedCooldownQuery(Beneficiary $beneficiary, AssistanceType $type): Builder
    {
        $query = BeneficiaryCooldown::query()
            ->where('assistance_type_id', $type->id);

        $useHouseholdScope = $type->cooldown_scope === 'per_household'
            && $beneficiary->household_id !== null;

        return $useHouseholdScope
            ? $query->where('household_id', $beneficiary->household_id)
            : $query->where('beneficiary_id', $beneficiary->id);
    }
}
