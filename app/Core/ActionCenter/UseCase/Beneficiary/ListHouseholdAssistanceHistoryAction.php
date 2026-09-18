<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryAssistanceHistoryEntry;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryHouseholdAssistanceInvolvementEntry;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\BeneficiaryAssistanceRole;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Support\Collection;

final class ListHouseholdAssistanceHistoryAction
{
    /**
     * List requests where this person was part of the saved household roster,
     * but was not the person for whom the assistance was intended.
     *
     * @return Collection<int, BeneficiaryHouseholdAssistanceInvolvementEntry>
     */
    public function execute(
        string $municipalId,
        BeneficiaryIdentityGroup $group,
    ): Collection {
        $beneficiaryIds = array_fill_keys($group->beneficiaryIds, true);
        $linkedMembers = HouseholdMember::withTrashed()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->get(['id', 'household_id']);
        $memberIds = $linkedMembers
            ->pluck('id')
            ->mapWithKeys(fn (mixed $id): array => [(string) $id => true])
            ->all();
        $householdIds = $linkedMembers
            ->pluck('household_id')
            ->merge($group->householdIds)
            ->filter()
            ->unique()
            ->values();

        if ($householdIds->isEmpty()) {
            return collect();
        }

        return AssistanceRequest::query()
            ->where('municipal_id', $municipalId)
            ->whereIn('household_id', $householdIds)
            ->with([
                'assistanceType',
                'snapshot',
                'household' => fn ($query) => $query->withTrashed(),
                'cooldowns' => fn ($query) => $query->whereIn('beneficiary_id', $group->beneficiaryIds),
            ])
            ->orderByDesc('created_at')
            ->get()
            ->filter(function (AssistanceRequest $request) use ($beneficiaryIds, $memberIds): bool {
                if ($this->isPersonallyReceived($request, $beneficiaryIds, $memberIds)) {
                    return false;
                }

                return $this->savedHouseholdIncludesIdentity(
                    $request,
                    $beneficiaryIds,
                    $memberIds,
                );
            })
            ->map(function (AssistanceRequest $request): BeneficiaryHouseholdAssistanceInvolvementEntry {
                $role = $request->on_behalf_household_member_id === null
                    ? BeneficiaryAssistanceRole::FiledForSelf
                    : BeneficiaryAssistanceRole::ReceivedOnBehalf;
                $identity = BeneficiaryAssistanceHistoryEntry::fromRequest($request, $role);
                $cooldown = $this->cooldownEffect($request);
                $snapshot = $this->savedHouseholdSnapshot($request);

                return new BeneficiaryHouseholdAssistanceInvolvementEntry(
                    request: $request,
                    filerFullName: $identity->filerFullName,
                    subjectFullName: $identity->subjectFullName,
                    householdCode: filled($snapshot['household_code'] ?? null)
                        ? (string) $snapshot['household_code']
                        : $request->household?->household_code,
                    cooldownState: $cooldown['state'],
                    cooldownStartsAt: $cooldown['starts_at'],
                    cooldownExpiresAt: $cooldown['expires_at'],
                );
            })
            ->values();
    }

    /**
     * @param  array<string, true>  $beneficiaryIds
     * @param  array<string, true>  $memberIds
     */
    private function isPersonallyReceived(
        AssistanceRequest $request,
        array $beneficiaryIds,
        array $memberIds,
    ): bool {
        if ($request->on_behalf_household_member_id === null) {
            return isset($beneficiaryIds[(string) $request->beneficiary_id]);
        }

        return isset($memberIds[(string) $request->on_behalf_household_member_id]);
    }

    /**
     * @param  array<string, true>  $beneficiaryIds
     * @param  array<string, true>  $memberIds
     */
    private function savedHouseholdIncludesIdentity(
        AssistanceRequest $request,
        array $beneficiaryIds,
        array $memberIds,
    ): bool {
        $snapshot = $this->savedHouseholdSnapshot($request);
        $members = is_array($snapshot['members'] ?? null) ? $snapshot['members'] : null;

        if ($members === null) {
            return false;
        }

        foreach ($members as $member) {
            if (! is_array($member)) {
                continue;
            }

            $beneficiaryId = filled($member['beneficiary_id'] ?? null)
                ? (string) $member['beneficiary_id']
                : null;
            $memberId = filled($member['household_member_id'] ?? null)
                ? (string) $member['household_member_id']
                : null;

            if (($beneficiaryId !== null && isset($beneficiaryIds[$beneficiaryId]))
                || ($memberId !== null && isset($memberIds[$memberId]))) {
                return true;
            }
        }

        return false;
    }

    /** @return array<string, mixed> */
    private function savedHouseholdSnapshot(AssistanceRequest $request): array
    {
        $assessment = data_get($request->metadata, 'household_assessment_snapshot');
        if (is_array($assessment) && is_array($assessment['members'] ?? null)) {
            return $assessment;
        }

        $filing = data_get($request->metadata, 'household_composition_snapshot');

        return is_array($filing) && is_array($filing['members'] ?? null)
            ? $filing
            : [];
    }

    /**
     * @return array{state:string, starts_at:?\DateTimeInterface, expires_at:?\DateTimeInterface}
     */
    private function cooldownEffect(AssistanceRequest $request): array
    {
        if ($request->status !== AssistanceStatus::Released || $request->released_at === null) {
            return ['state' => 'unreleased', 'starts_at' => null, 'expires_at' => null];
        }

        /** @var Collection<int, BeneficiaryCooldown> $cooldowns */
        $cooldowns = $request->cooldowns;
        $permanent = $cooldowns->first(
            fn (BeneficiaryCooldown $cooldown): bool => $cooldown->cooldown_expires_at === null,
        );

        if ($permanent !== null) {
            return [
                'state' => 'permanent',
                'starts_at' => $permanent->cooldown_starts_at,
                'expires_at' => null,
            ];
        }

        $latest = $cooldowns
            ->sortByDesc(fn (BeneficiaryCooldown $cooldown): int => $cooldown->cooldown_expires_at?->getTimestamp() ?? 0)
            ->first();

        if ($latest !== null) {
            return [
                'state' => $latest->cooldown_expires_at?->isFuture() ? 'active' : 'expired',
                'starts_at' => $latest->cooldown_starts_at,
                'expires_at' => $latest->cooldown_expires_at,
            ];
        }

        $policy = data_get($request->metadata, 'cooldown_policy');
        if (! is_array($policy)) {
            return ['state' => 'legacy_unavailable', 'starts_at' => null, 'expires_at' => null];
        }

        if (($policy['type'] ?? null) !== 'one_time' && (int) ($policy['months'] ?? 0) === 0) {
            return ['state' => 'none_configured', 'starts_at' => null, 'expires_at' => null];
        }

        return ['state' => 'not_captured', 'starts_at' => null, 'expires_at' => null];
    }
}
