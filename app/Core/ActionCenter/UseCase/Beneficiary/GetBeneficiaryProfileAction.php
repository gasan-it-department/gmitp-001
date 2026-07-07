<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Household\EvaluateHouseholdHeadCandidateAction;
use Illuminate\Database\Eloquent\ModelNotFoundException;

/**
 * Assembles the full admin "review the person" view for one beneficiary.
 *
 * Unlike the assistance-request detail page (which reads frozen snapshot_*
 * columns for COA), this is the LIVE picture used to DECIDE: current household
 * composition, current total income, and the person's entire assistance
 * history across every program. The reviewer cross-checks it against the
 * uploaded government ID before processing a request.
 *
 * Tenant guard mirrors GetAssistanceRequestProfileAction: a beneficiary whose
 * household belongs to another municipality returns 404 (not 403 — confirming
 * "this ID exists but isn't yours" is itself a leak).
 *
 * @return array{
 *     beneficiary: Beneficiary,
 *     householdMembers: \Illuminate\Database\Eloquent\Collection,
 *     assistanceHistory: \Illuminate\Database\Eloquent\Collection,
 *     householdTotalIncome: float,
 *     summary: array{total_requests:int, released_count:int, total_released_amount:float, active_member_count:int},
 *     crossMunicipalityMatches: \Illuminate\Support\Collection,
 *     merge: array{is_merged_duplicate:bool, merged_into:?array, merged_duplicates:array},
 * }
 */
class GetBeneficiaryProfileAction
{
    public function __construct(
        private readonly FindCrossMunicipalityMatchesAction $findCrossMunicipalityMatches,
        private readonly ResolveBeneficiaryIdentityGroupAction $resolveGroup,
        private readonly FindHouseholdMembershipMatchesAction $findHouseholdMatches,
        private readonly EvaluateHouseholdHeadCandidateAction $evaluateHeadCandidate,
    ) {
    }

    public function execute(string $municipalId, string $beneficiaryId): array
    {
        $beneficiary = Beneficiary::with([
            'household',
            'religion',
            'user:id,email',
            'media', // profile photo (avatar collection)
            // Duplicate-merge links for the banner / merged-duplicates panel.
            'mergedInto',
            'mergedDuplicates',
            'identityVerifier',
            'intakeRejector',
        ])->findOrFail($beneficiaryId);

        // Tenant scope — municipal_id lives on the household.
        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new ModelNotFoundException;
        }

        // Resolve the identity group so history + summary span the canonical
        // plus any merged duplicates (read-only — frozen rows are never moved).
        $group = $this->resolveGroup->execute($beneficiary);

        // Full family composition for the admin roster manager — head first,
        // then current (active) members, then moved-out (inactive) ones last.
        // Income + the active count below are computed from the active subset
        // only, so moving someone out drops them from the household economics.
        $householdMembers = HouseholdMember::query()
            ->with('beneficiary.household:id,household_code')
            ->where('household_id', $beneficiary->household_id)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderByDesc('is_active')
            ->orderBy('created_at')
            ->get();

        $activeMembers = $householdMembers->filter(
            fn(HouseholdMember $member) => $member->is_active
            && ($member->relationship === 'head' || $member->is_verified_dependent)
        );

        // Every request the identity GROUP has ever filed, across all programs.
        // After a merge this includes the duplicate's frozen history so the
        // canonical profile shows one complete record (rows stay owned by their
        // original beneficiary_id — nothing is rewritten).
        $assistanceHistory = AssistanceRequest::query()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->with('assistanceType')
            ->orderByDesc('created_at')
            ->get();

        // Advisory cross-LGU double-dip signal — same person on record in
        // another municipality. Minimal disclosure (see the detector).
        $crossMunicipalityMatches = $this->findCrossMunicipalityMatches->execute(
            $beneficiary->first_name,
            $beneficiary->last_name,
            $beneficiary->birth_date,
            $beneficiary->sex,
            $municipalId,
        );

        $householdTotalIncome = (float) $activeMembers->sum(fn(HouseholdMember $m) => (float) $m->monthly_income);

        // status is cast to the AssistanceStatus enum, so filter on its value
        // (a loose ->where('status', 'released') would compare enum !== string
        // and silently match nothing).
        $releasedHistory = $assistanceHistory->filter(
            fn(AssistanceRequest $r) => $r->status?->value === 'released'
        );

        $currentHead = $householdMembers->first(
            fn(HouseholdMember $member) => $member->is_active
            && $member->relationship === 'head',
        );

        $headCandidates = $householdMembers
            ->reject(fn(HouseholdMember $member) => $member->id === $currentHead?->id)
            ->mapWithKeys(fn(HouseholdMember $member) => [
                $member->id => $this->evaluateHeadCandidate->execute($member, $beneficiary->household),
            ]);

        return [
            'beneficiary' => $beneficiary,
            'householdMembers' => $householdMembers,
            'assistanceHistory' => $assistanceHistory,
            'householdTotalIncome' => $householdTotalIncome,
            'crossMunicipalityMatches' => $crossMunicipalityMatches,
            'householdMatches' => $this->findHouseholdMatches->execute($beneficiary)
                ->map(fn(HouseholdMember $member) => [
                    'member_id' => $member->id,
                    'household_id' => $member->household_id,
                    'household_code' => $member->household?->household_code,
                    'barangay' => $member->household?->barangay,
                    'street' => $member->household?->street,
                    'head_name' => $member->household?->activeHead?->beneficiary?->full_name,
                    'head_beneficiary_id' => $member->household?->activeHead?->beneficiary_id,
                    'member_name' => trim(implode(' ', array_filter([
                        $member->first_name,
                        $member->middle_name,
                        $member->last_name,
                        $member->suffix,
                    ]))),
                    'birth_date' => $member->birth_date?->toDateString(),
                    'relationship' => $member->relationship,
                    'is_exact_match' => true,
                ])
                ->values(),
            // Duplicate-merge state for the profile banner + merged-duplicates
            // panel. is_merged_duplicate → THIS record was merged away (read-only);
            // merged_duplicates → records merged INTO this canonical.
            'merge' => [
                'is_merged_duplicate' => $beneficiary->merged_into_beneficiary_id !== null,
                'merged_into' => $beneficiary->mergedInto
                    ? [
                        'id' => $beneficiary->mergedInto->id,
                        'beneficiary_number' => $beneficiary->mergedInto->beneficiary_number,
                        'full_name' => $beneficiary->mergedInto->full_name,
                    ]
                    : null,
                'merged_duplicates' => $beneficiary->mergedDuplicates
                    ->map(fn(Beneficiary $d) => [
                        'id' => $d->id,
                        'beneficiary_number' => $d->beneficiary_number,
                        'full_name' => $d->full_name,
                    ])
                    ->values()
                    ->all(),
            ],
            'summary' => [
                'total_requests' => $assistanceHistory->count(),
                'released_count' => $releasedHistory->count(),
                'total_released_amount' => (float) $releasedHistory->sum(fn(AssistanceRequest $r) => (float) ($r->amount_approved ?? 0)),
                'active_member_count' => $activeMembers->count(),
            ],
            'householdHead' => [
                'current_head_member_id' => $currentHead?->id,
                'profile_is_current_head' => $currentHead?->beneficiary_id === $beneficiary->id,
                'household_on_hold' => $currentHead === null,
                'candidate_reasons' => $headCandidates->all(),
            ],
        ];
    }
}
