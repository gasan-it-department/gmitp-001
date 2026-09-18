<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryAssistanceHistoryEntry;
use App\Core\ActionCenter\Dto\Beneficiary\HouseholdAssistanceHistory;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\BeneficiaryAssistanceRole;
use App\Core\ActionCenter\Models\AssistanceRequest;

final class ListHouseholdAssistanceHistoryAction
{
    public function execute(string $municipalId, string $householdId): HouseholdAssistanceHistory
    {
        $entries = AssistanceRequest::query()
            ->where('municipal_id', $municipalId)
            ->where('household_id', $householdId)
            ->with(['assistanceType', 'snapshot'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function (AssistanceRequest $request): BeneficiaryAssistanceHistoryEntry {
                $role = $request->on_behalf_household_member_id === null
                    ? BeneficiaryAssistanceRole::FiledForSelf
                    : BeneficiaryAssistanceRole::ReceivedOnBehalf;

                return BeneficiaryAssistanceHistoryEntry::fromRequest($request, $role);
            });

        $released = $entries->filter(
            fn (BeneficiaryAssistanceHistoryEntry $entry): bool => $entry->request->status === AssistanceStatus::Released,
        );

        return new HouseholdAssistanceHistory(
            entries: $entries,
            requestCount: $entries->count(),
            releasedCount: $released->count(),
            totalReleasedAmount: (float) $released->sum(
                fn (BeneficiaryAssistanceHistoryEntry $entry): float => (float) ($entry->request->amount_approved ?? 0),
            ),
        );
    }
}
