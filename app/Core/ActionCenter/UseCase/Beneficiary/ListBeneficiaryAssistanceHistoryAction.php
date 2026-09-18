<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryAssistanceHistory;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryAssistanceHistoryEntry;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\BeneficiaryAssistanceRole;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Database\Eloquent\Builder;

final class ListBeneficiaryAssistanceHistoryAction
{
    public function execute(string $municipalId, BeneficiaryIdentityGroup $group): BeneficiaryAssistanceHistory
    {
        $memberIds = HouseholdMember::withTrashed()
            ->whereIn('beneficiary_id', $group->beneficiaryIds)
            ->pluck('id');

        $requests = AssistanceRequest::query()
            ->where('municipal_id', $municipalId)
            ->where(function (Builder $query) use ($group, $memberIds): void {
                $query->where(function (Builder $selfRequest) use ($group): void {
                    $selfRequest
                        ->whereIn('beneficiary_id', $group->beneficiaryIds)
                        ->whereNull('on_behalf_household_member_id');
                });

                if ($memberIds->isNotEmpty()) {
                    $query->orWhereIn('on_behalf_household_member_id', $memberIds);
                }
            })
            ->with(['assistanceType', 'snapshot'])
            ->orderByDesc('created_at')
            ->get()
            ->unique('id')
            ->values();

        $entries = $requests->map(function (AssistanceRequest $request): BeneficiaryAssistanceHistoryEntry {
            $role = $request->on_behalf_household_member_id === null
                ? BeneficiaryAssistanceRole::FiledForSelf
                : BeneficiaryAssistanceRole::ReceivedOnBehalf;

            return BeneficiaryAssistanceHistoryEntry::fromRequest($request, $role);
        });

        $releasedReceived = $entries->filter(
            fn (BeneficiaryAssistanceHistoryEntry $entry): bool => $entry->request->status === AssistanceStatus::Released,
        );

        return new BeneficiaryAssistanceHistory(
            entries: $entries,
            receivedRequestCount: $entries->count(),
            releasedReceivedCount: $releasedReceived->count(),
            totalReleasedReceivedAmount: (float) $releasedReceived->sum(
                fn (BeneficiaryAssistanceHistoryEntry $entry): float => (float) ($entry->request->amount_approved ?? 0),
            ),
        );
    }
}
