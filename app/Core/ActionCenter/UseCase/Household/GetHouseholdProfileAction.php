<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;

final class GetHouseholdProfileAction
{
    public function __construct(
        private readonly EvaluateHouseholdHeadCandidateAction $evaluateHeadCandidate,
        private readonly ListHouseholdAssistanceHistoryAction $listHistory,
    ) {}

    /** @return array<string, mixed> */
    public function execute(string $municipalId, string $householdId): array
    {
        $household = Household::query()
            ->where('municipal_id', $municipalId)
            ->with([
                'members' => fn ($query) => $query
                    ->with('beneficiary.household:id,household_code')
                    ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
                    ->orderByDesc('is_active')
                    ->orderBy('created_at'),
                'activeHead.beneficiary',
            ])
            ->findOrFail($householdId);

        $activeMembers = $household->members->filter(
            fn (HouseholdMember $member): bool => $member->is_active,
        );
        $currentHead = $activeMembers->first(
            fn (HouseholdMember $member): bool => $member->relationship === Relationship::Head->value,
        );
        $headCandidates = $household->members
            ->reject(fn (HouseholdMember $member): bool => $member->id === $currentHead?->id)
            ->mapWithKeys(fn (HouseholdMember $member): array => [
                $member->id => $this->evaluateHeadCandidate->execute($member, $household),
            ]);
        $history = $this->listHistory->execute($municipalId, $household->id);

        return [
            'household' => $household,
            'history' => $history,
            'summary' => [
                'active_member_count' => $activeMembers->count(),
                'moved_out_member_count' => $household->members->where('is_active', false)->count(),
                'estimated_monthly_income' => (float) $activeMembers->sum(
                    fn (HouseholdMember $member): float => (float) $member->monthly_income,
                ),
            ],
            'headState' => [
                'current_head_member_id' => $currentHead?->id,
                'household_on_hold' => $currentHead === null,
                'candidate_reasons' => $headCandidates->all(),
            ],
        ];
    }
}
