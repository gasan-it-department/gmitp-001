<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\LinkedHouseholdMemberProfileSynchronizer;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
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
    public function __construct(
        private readonly LinkedHouseholdMemberProfileSynchronizer $profileSynchronizer,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
    ) {}

    public function execute(
        string $memberId,
        bool $isActive,
        string $municipalId,
        ?string $restoreRelationship = null,
    ): HouseholdMember {
        return DB::transaction(function () use ($memberId, $isActive, $municipalId, $restoreRelationship) {
            $this->lockMunicipality->execute($municipalId);
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

            // No-op — already in the requested state.
            if ((bool) $member->is_active === $isActive && $restoreRelationship === null) {
                return $member;
            }

            $restoredRelationship = $this->resolveRestoreRelationship(
                member: $member,
                isActive: $isActive,
                relationship: $restoreRelationship,
            );

            if ($member->relationship === Relationship::Head->value && $isActive) {
                $hasActiveHead = HouseholdMember::query()
                    ->where('household_id', $member->household_id)
                    ->where('relationship', Relationship::Head->value)
                    ->where('is_active', true)
                    ->exists();

                if ($hasActiveHead && $restoredRelationship === null) {
                    throw new \DomainException(
                        'This household already has an active head. Choose the former head\'s new relationship before moving them back in.',
                    );
                }

                if (! $hasActiveHead && $restoredRelationship !== null) {
                    throw new \DomainException(
                        'This household has no active head. Restore this member as head or assign a new head first.',
                    );
                }
            }

            // Re-activating: respect the per-household active-member cap.
            $linkedBeneficiary = null;
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

                if ($member->beneficiary_id !== null) {
                    $beneficiary = Beneficiary::query()
                        ->whereKey($member->beneficiary_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    if ($beneficiary->household_id !== $member->household_id) {
                        throw new \DomainException(
                            'This beneficiary is assigned to another primary household. Use Transfer/Reassign Household to move them back.',
                        );
                    }

                    if (HouseholdMember::query()
                        ->where('beneficiary_id', $beneficiary->id)
                        ->where('is_active', true)
                        ->whereKeyNot($member->id)
                        ->exists()) {
                        throw new \DomainException(
                            'This beneficiary is already active in another roster row. Use Transfer/Reassign Household.',
                        );
                    }

                    if (! $beneficiary->is_active) {
                        $beneficiary->update(['is_active' => true]);
                    }

                    $linkedBeneficiary = $beneficiary;
                }
            }

            $memberChanges = ['is_active' => $isActive];
            if ($restoredRelationship !== null) {
                $memberChanges['relationship'] = $restoredRelationship->value;
                $memberChanges['is_verified_dependent'] = false;
            }

            $member->update($memberChanges);

            if ($linkedBeneficiary !== null) {
                $this->profileSynchronizer->sync($member, $linkedBeneficiary);
            }

            if (! $isActive && $member->beneficiary_id !== null) {
                $beneficiary = Beneficiary::query()
                    ->whereKey($member->beneficiary_id)
                    ->lockForUpdate()
                    ->first();
                if ($beneficiary?->household_id === $member->household_id && $beneficiary->is_active) {
                    $beneficiary->update(['is_active' => false]);
                }
            }

            return $member->fresh();
        }, attempts: 3);
    }

    private function resolveRestoreRelationship(
        HouseholdMember $member,
        bool $isActive,
        ?string $relationship,
    ): ?Relationship {
        if ($relationship === null) {
            return null;
        }

        if (! $isActive || $member->is_active) {
            throw new \DomainException(
                'A replacement relationship may only be selected when moving a former head back in.',
            );
        }

        if ($member->relationship !== Relationship::Head->value) {
            throw new \DomainException(
                'Only a former household head needs a replacement relationship when moving back in.',
            );
        }

        $resolved = Relationship::tryFrom($relationship);
        if ($resolved === null || $resolved === Relationship::Head) {
            throw new \DomainException(
                'Choose the former head\'s relationship to the current household head.',
            );
        }

        return $resolved;
    }
}
