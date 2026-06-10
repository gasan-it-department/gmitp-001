<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Dto\Beneficiary\EligibilityResult;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\BeneficiaryFlag;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

/**
 * Decide whether a beneficiary may file a new request for a given assistance type.
 *
 * Every check runs across the beneficiary's IDENTITY GROUP — the canonical
 * record plus any duplicates merged into it (ResolveBeneficiaryIdentityGroupAction).
 * This is what stops the two-accounts double-dip: a merged duplicate's cooldowns,
 * in-flight requests, and blacklist flags are all seen as the same person's, so a
 * second account can no longer run an independent cooldown clock.
 *
 * Business rule (MSWD Gasan):
 *   When a beneficiary is granted ANY STANDARD assistance with a per_request
 *   cooldown (e.g. Educational = 12 months), they are locked out of ALL other
 *   STANDARD assistance types for the duration of that cooldown — not just the
 *   type they received. This prevents stacking benefits across programs.
 *
 * INDEPENDENT programs (AssistanceType::is_independent — currently Burial) sit
 * OUTSIDE the cross-program lockout entirely:
 *   - their cooldowns never block other programs, and other programs' cooldowns
 *     never block them (a death is an emergency that must not be gated by an
 *     unrelated medical/educational cooldown);
 *   - they are scoped PER DECEASED PERSON: the 12-month burial cooldown is keyed
 *     on the on-behalf household member (the deceased), so the family can still
 *     file burial for a DIFFERENT member who dies within the window.
 *
 * Blocking conditions, evaluated in order:
 *   0. Blacklist hold — an active blacklist flag on the identity group (e.g.
 *      confirmed duplicate-account fraud). Hard-blocks EVERY self-service
 *      application (standard AND independent) until an admin lifts it; the
 *      citizen is directed to the MSWD office.
 *   1. Permanent block (per-type) — a row exists in ac_beneficiary_cooldowns
 *      with cooldown_expires_at IS NULL FOR THIS TYPE (one_time programs).
 *   2. Cross-program cooldown — any STANDARD-type row exists for this group
 *      with cooldown_expires_at > NOW(). Blocks every standard type until the
 *      longest-running cooldown expires.
 *   3. Cross-program in-flight — a pending/under_review request for ANY STANDARD
 *      type. Blocks every standard card until that request resolves.
 *
 * Use the bulk path (executeBatch) on the portal card grid so we hit the
 * database only a few times regardless of how many types are rendered. The card
 * grid has no chosen deceased, so independent types show as eligible there —
 * their per-deceased gate is enforced at apply/store time via execute().
 */
class CheckElegibilityAction
{
    /**
     * Statuses that count as "open" — the citizen has something in queue.
     * Approved/released/rejected/cancelled are all terminal for this guard.
     */
    private const IN_FLIGHT_STATUSES = ['pending', 'under_review'];

    public function __construct(
        private readonly ResolveBeneficiaryIdentityGroupAction $resolveGroup,
    ) {
    }

    /**
     * Single-type evaluation. Use this in the Apply controller and the citizen
     * store controller. For an independent, on-behalf-of-deceased type (Burial)
     * pass the on-behalf context so the per-deceased gate can run.
     */
    public function execute(
        Beneficiary $beneficiary,
        AssistanceType $type,
        ?string $onBehalfHouseholdMemberId = null,
        ?string $onBehalfDateOfDeath = null,
    ): EligibilityResult {
        $group = $this->resolveGroup->execute($beneficiary);

        // Rule 0 — blacklist hold on the identity group. Hard-blocks everything,
        // including independent programs (a confirmed fraud hold is resolved in
        // person, where burial can still be handled via admin override).
        if ($this->hasActiveBlacklistFlag($group)) {
            return EligibilityResult::blocked();
        }

        // Independent programs (Burial) are evaluated in isolation, per deceased.
        if ($type->is_independent) {
            return $this->evaluateIndependent(
                $group,
                $type,
                $onBehalfHouseholdMemberId,
                $onBehalfDateOfDeath,
            );
        }

        // Rule 1 — permanent block for THIS type (one_time)
        if ($this->hasPermanentBlock($group, $type)) {
            return EligibilityResult::permanentBlock();
        }

        // Rule 2 — cross-program active cooldown (standard types only)
        if ($cooldown = $this->findLongestActiveCooldown($group)) {
            return EligibilityResult::onCooldown($cooldown->cooldown_expires_at);
        }

        // Rule 3 — cross-program in-flight request (standard types only)
        if ($this->hasAnyInFlightRequest($group)) {
            return EligibilityResult::inFlightRequest();
        }

        return EligibilityResult::eligible();
    }

    /**
     * Bulk-evaluate eligibility for a list of assistance types.
     *
     * Same rules as execute(), but uses a small fixed number of queries
     * regardless of how many types are passed in — designed for the portal card
     * grid where we render every active assistance type and need per-card
     * disabled state without N+1 lookups.
     *
     * Independent types (Burial) are shown eligible here (unless blacklisted):
     * the card grid has no chosen deceased, so their per-deceased gate is
     * deferred to the store.
     *
     * @param  Collection<int, AssistanceType>  $types
     * @return array<string, EligibilityResult>  keyed by assistance_type_id
     */
    public function executeBatch(Beneficiary $beneficiary, Collection $types): array
    {
        if ($types->isEmpty()) {
            return [];
        }

        $group = $this->resolveGroup->execute($beneficiary);

        // Rule 0 — a blacklist hold blocks every card outright.
        if ($this->hasActiveBlacklistFlag($group)) {
            return $types->mapWithKeys(
                fn (AssistanceType $type) => [$type->id => EligibilityResult::blocked()]
            )->all();
        }

        // Query 1 — every STANDARD cooldown row that touches the identity group
        // (any member beneficiary or any member household). Independent-type rows
        // (Burial) are excluded so they never cross-block other programs.
        $cooldowns = BeneficiaryCooldown::query()
            ->where(fn (Builder $q) => $this->scopeToGroup($q, $group))
            ->whereHas('assistanceType', fn (Builder $q) => $q->where('is_independent', false))
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

        // Query 2 — does the group have ANY in-flight STANDARD request?
        // Cross-program: an open Medical request blocks the Educational card too,
        // but an open Burial request does not (independent).
        $hasInFlight = AssistanceRequest::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->whereHas('assistanceType', fn (Builder $q) => $q->where('is_independent', false))
            ->exists();

        // Per-type verdicts, applying the rule precedence in memory.
        $results = [];
        foreach ($types as $type) {
            // Independent (Burial): eligible at the grid; gated per-deceased at store.
            if ($type->is_independent) {
                $results[$type->id] = EligibilityResult::eligible();
                continue;
            }

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

    // ─────────────────────────────────────────────────────────────────────
    // Blacklist (identity-group hold)
    // ─────────────────────────────────────────────────────────────────────

    /**
     * True when any beneficiary in the identity group carries an active
     * (non-expired) blacklist flag. One grouped query.
     */
    private function hasActiveBlacklistFlag(BeneficiaryIdentityGroup $group): bool
    {
        return BeneficiaryFlag::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->where('severity', BeneficiaryFlag::SEVERITY_BLACKLIST)
            ->active()
            ->exists();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Independent (per-deceased) evaluation — Burial
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Evaluate an independent, on-behalf-of-deceased program in isolation.
     *
     * The cooldown is keyed on the deceased: the SAME deceased is blocked for
     * 12 months, a DIFFERENT household member who dies is not. On-roster deceased
     * are matched on the on-behalf household member id (indexed); off-roster
     * deceased fall back to matching an approved request by date of death across
     * the identity group's households.
     */
    private function evaluateIndependent(
        BeneficiaryIdentityGroup $group,
        AssistanceType $type,
        ?string $memberId,
        ?string $dateOfDeath,
    ): EligibilityResult {
        if ($memberId !== null) {
            $rows = BeneficiaryCooldown::query()
                ->where('assistance_type_id', $type->id)
                ->where('household_member_id', $memberId)
                ->get();

            // A NULL expiry would mean a one_time independent program — honor it.
            if ($rows->whereNull('cooldown_expires_at')->isNotEmpty()) {
                return EligibilityResult::permanentBlock();
            }

            $active = $rows
                ->filter(fn (BeneficiaryCooldown $c) => $c->cooldown_expires_at !== null
                    && $c->cooldown_expires_at->isFuture())
                ->sortByDesc('cooldown_expires_at')
                ->first();

            if ($active !== null) {
                return EligibilityResult::onCooldown($active->cooldown_expires_at);
            }

            // A pending / under_review request for the SAME deceased blocks a duplicate.
            $inFlight = AssistanceRequest::query()
                ->where('assistance_type_id', $type->id)
                ->where('on_behalf_household_member_id', $memberId)
                ->whereIn('status', self::IN_FLIGHT_STATUSES)
                ->exists();

            if ($inFlight) {
                return EligibilityResult::inFlightRequest();
            }

            return EligibilityResult::eligible();
        }

        // Off-roster deceased (no member row): match an approved request by date
        // of death across the group's households.
        if ($dateOfDeath !== null) {
            if ($expiry = $this->findDeceasedRequestCooldownExpiry($group, $type, $dateOfDeath)) {
                return EligibilityResult::onCooldown($expiry);
            }
        }

        return EligibilityResult::eligible();
    }

    /**
     * Fallback per-deceased check for an off-roster deceased: the most recent
     * APPROVED request for this program + date of death across the group's
     * households; its cooldown expiry is approved_at + cooldown_months. Returns
     * the expiry only when it is still in the future.
     */
    private function findDeceasedRequestCooldownExpiry(
        BeneficiaryIdentityGroup $group,
        AssistanceType $type,
        string $dateOfDeath,
    ): ?CarbonImmutable {
        $request = AssistanceRequest::query()
            ->whereIn('household_id', $group->householdIds)
            ->where('assistance_type_id', $type->id)
            ->whereNotNull('approved_at')
            ->whereDate('on_behalf_date_of_death', $dateOfDeath)
            ->orderByDesc('approved_at')
            ->first();

        if ($request === null || $request->approved_at === null) {
            return null;
        }

        $expiry = CarbonImmutable::instance($request->approved_at)
            ->addMonths((int) $type->cooldown_months);

        return $expiry->isFuture() ? $expiry : null;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Standard (cross-program) evaluation
    // ─────────────────────────────────────────────────────────────────────

    private function hasPermanentBlock(BeneficiaryIdentityGroup $group, AssistanceType $type): bool
    {
        // For one_time blocks we DO honor the originating type's scope —
        // a Burial approval shouldn't block another family member's Medical.
        return $this->scopedCooldownQuery($group, $type)
            ->whereNull('cooldown_expires_at')
            ->exists();
    }

    /**
     * The active STANDARD cooldown with the latest expiry — that's the "real"
     * wait the citizen has to serve, even if it came from a different program.
     * Independent-type cooldowns (Burial) are excluded — they never cross-block.
     *
     * No assistance_type_id filter: this is the cross-program lockout query.
     */
    private function findLongestActiveCooldown(BeneficiaryIdentityGroup $group): ?BeneficiaryCooldown
    {
        return BeneficiaryCooldown::query()
            ->where(fn (Builder $q) => $this->scopeToGroup($q, $group))
            ->whereHas('assistanceType', fn (Builder $q) => $q->where('is_independent', false))
            ->whereNotNull('cooldown_expires_at')
            ->where('cooldown_expires_at', '>', now())
            ->orderByDesc('cooldown_expires_at')
            ->first();
    }

    private function hasAnyInFlightRequest(BeneficiaryIdentityGroup $group): bool
    {
        return AssistanceRequest::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->whereIn('status', self::IN_FLIGHT_STATUSES)
            ->whereHas('assistanceType', fn (Builder $q) => $q->where('is_independent', false))
            ->exists();
    }

    /**
     * Scope-aware query used ONLY for the permanent (one_time) block check.
     *
     *   per_beneficiary → only this group's individuals' history matters.
     *   per_household   → any group household's prior approval blocks the
     *                     whole household for THIS type (E.O. pattern).
     */
    private function scopedCooldownQuery(BeneficiaryIdentityGroup $group, AssistanceType $type): Builder
    {
        $query = BeneficiaryCooldown::query()
            ->where('assistance_type_id', $type->id);

        $useHouseholdScope = $type->cooldown_scope === 'per_household'
            && ! empty($group->householdIds);

        return $useHouseholdScope
            ? $query->whereIn('household_id', $group->householdIds)
            : $query->whereIn('beneficiary_id', $group->beneficiaryIds);
    }

    /**
     * Shared cross-program scope: cooldown rows touching ANY beneficiary or ANY
     * household in the identity group. Applied inside a nested where() so callers
     * can chain further constraints.
     */
    private function scopeToGroup(Builder $query, BeneficiaryIdentityGroup $group): Builder
    {
        $query->whereIn('beneficiary_id', $group->beneficiaryIds);

        if (! empty($group->householdIds)) {
            $query->orWhereIn('household_id', $group->householdIds);
        }

        return $query;
    }
}
