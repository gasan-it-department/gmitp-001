<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestIntakeSheetData;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
                'assistanceType.documents',
                'beneficiary',
                'encodedBy',
                'reviewedBy',
                'approvedBy',
                'rejectedBy',
                'cancelledBy',
                'releasedBy',
                'media',
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
            municipalityName: $municipalityName,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }
}
