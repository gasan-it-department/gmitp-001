<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class GenerateAssistanceRequestIntakeSheetAction
{
    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        ?string $municipalityName,
        string $generatedByUserName,
    ): AssistanceRequestIntakeSheetData {
        $request = AssistanceRequest::query()
            ->with([
                'assistanceType',
                'beneficiary',
                'snapshot',
                'onBehalfHouseholdMember',
            ])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate intake sheets for assistance requests in your own municipality.',
            );
        }

        return new AssistanceRequestIntakeSheetData(
            request: $request,
            householdMembers: $this->loadCurrentHouseholdMembers($request->household_id),
            municipalityName: $municipalityName,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    /**
     * The request's claimant/address fields are frozen in the snapshot table.
     * Household composition is intentionally read live because member rows are
     * not snapshotted per request yet.
     *
     * @return Collection<int, HouseholdMember>
     */
    private function loadCurrentHouseholdMembers(string $householdId): Collection
    {
        return HouseholdMember::query()
            ->where('household_id', $householdId)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();
    }
}
