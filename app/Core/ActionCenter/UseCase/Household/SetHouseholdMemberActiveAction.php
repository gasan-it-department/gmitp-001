<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

/**
 * Flip a household member's `is_active` flag — the "moved out" / "moved back in"
 * toggle. Records are NEVER hard-deleted: a deactivated row stays as history and
 * simply drops out of the active composition + household income total.
 *
 * Guards:
 *   • Tenant — the member's household must belong to the acting municipality.
 *   • Head — the head row mirrors the beneficiary and cannot be moved out
 *     (relocating the beneficiary is a separate flow).
 *   • Cap — re-activating a member re-checks the per-household active-member
 *     limit so a restore can't silently push a household over it.
 *
 * Auditing is automatic: `is_active` is in HouseholdMember's LogsActivity set.
 */
class SetHouseholdMemberActiveAction
{
    public function execute(string $memberId, bool $isActive, string $municipalId): HouseholdMember
    {
        return DB::transaction(function () use ($memberId, $isActive, $municipalId) {
            $member = HouseholdMember::query()
                ->with('household')
                ->whereKey($memberId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($member->household?->municipal_id !== $municipalId) {
                throw new AuthorizationException(
                    'You may only manage household members from your own municipality.',
                );
            }

            if ($member->relationship === Relationship::Head->value && ! $isActive) {
                throw new \DomainException(
                    'The head of the household cannot be marked as moved out from the roster manager. Use the Reassign Household workflow instead.',
                );
            }

            if ($member->relationship === Relationship::Head->value && $isActive) {
                $hasActiveHead = HouseholdMember::query()
                    ->where('household_id', $member->household_id)
                    ->where('relationship', Relationship::Head->value)
                    ->where('is_active', true)
                    ->exists();

                if ($hasActiveHead) {
                    throw new \DomainException(
                        'This household already has an active head. You cannot move this member back in as a head without resolving the roster first.',
                    );
                }
            }

            // No-op — already in the requested state.
            if ((bool) $member->is_active === $isActive) {
                return $member;
            }

            // Re-activating: respect the per-household active-member cap.
            if ($isActive) {
                $activeCount = HouseholdMember::query()
                    ->where('household_id', $member->household_id)
                    ->where('is_active', true)
                    ->count();

                if ($activeCount >= StoreHouseholdMemberAction::ACTIVE_MEMBER_HARD_LIMIT) {
                    throw new \DomainException(sprintf(
                        'This household already has %d active members. Move someone out before restoring another.',
                        StoreHouseholdMemberAction::ACTIVE_MEMBER_HARD_LIMIT,
                    ));
                }
            }

            $member->update(['is_active' => $isActive]);


            return $member->fresh();
        }, attempts: 3);
    }
}
