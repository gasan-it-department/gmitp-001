<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
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
 * }
 */
class GetBeneficiaryProfileAction
{
    public function __construct(
        private readonly FindCrossMunicipalityMatchesAction $findCrossMunicipalityMatches,
    ) {
    }

    public function execute(string $municipalId, string $beneficiaryId): array
    {
        $beneficiary = Beneficiary::with([
            'household',
            'religion',
            'user:id,email',
            'media', // profile photo (avatar collection)
        ])->findOrFail($beneficiaryId);

        // Tenant scope — municipal_id lives on the household.
        if ($beneficiary->household?->municipal_id !== $municipalId) {
            throw new ModelNotFoundException();
        }

        // Full family composition for the admin roster manager — head first,
        // then current (active) members, then moved-out (inactive) ones last.
        // Income + the active count below are computed from the active subset
        // only, so moving someone out drops them from the household economics.
        $householdMembers = HouseholdMember::query()
            ->where('household_id', $beneficiary->household_id)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderByDesc('is_active')
            ->orderBy('created_at')
            ->get();

        $activeMembers = $householdMembers->where('is_active', true);

        // Every request this beneficiary has ever filed, across all programs.
        $assistanceHistory = AssistanceRequest::query()
            ->where('beneficiary_id', $beneficiary->id)
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

        $householdTotalIncome = (float) $activeMembers->sum(fn (HouseholdMember $m) => (float) $m->monthly_income);

        // status is cast to the AssistanceStatus enum, so filter on its value
        // (a loose ->where('status', 'released') would compare enum !== string
        // and silently match nothing).
        $releasedHistory = $assistanceHistory->filter(
            fn (AssistanceRequest $r) => $r->status?->value === 'released'
        );

        return [
            'beneficiary'              => $beneficiary,
            'householdMembers'         => $householdMembers,
            'assistanceHistory'        => $assistanceHistory,
            'householdTotalIncome'     => $householdTotalIncome,
            'crossMunicipalityMatches' => $crossMunicipalityMatches,
            'summary'                  => [
                'total_requests'        => $assistanceHistory->count(),
                'released_count'        => $releasedHistory->count(),
                'total_released_amount' => (float) $releasedHistory->sum(fn (AssistanceRequest $r) => (float) ($r->amount_approved ?? 0)),
                'active_member_count'   => $activeMembers->count(),
            ],
        ];
    }
}
