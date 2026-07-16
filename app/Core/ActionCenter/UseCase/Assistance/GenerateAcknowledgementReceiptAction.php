<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class GenerateAcknowledgementReceiptAction
{
    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        ?string $municipalityName,
        string $generatedByUserName,
    ): AcknowledgementReceiptData {
        $request = AssistanceRequest::query()
            ->with([
                'assistanceType',
                'beneficiary',
                'releasedBy',
                'snapshot',
                'onBehalfHouseholdMember',
            ])
            ->whereKey($assistanceRequestId)
            ->firstOr(function () {
                throw new ModelNotFoundException('Assistance request not found.');
            });

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate acknowledgement receipts for assistance requests in your own municipality.',
            );
        }

        $this->ensureReceiptAllowed($request);

        return new AcknowledgementReceiptData(
            request: $request,
            municipalityName: $municipalityName,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    private function ensureReceiptAllowed(AssistanceRequest $request): void
    {
        if (in_array($request->status, [AssistanceStatus::Approved, AssistanceStatus::Released], true)) {
            return;
        }

        throw new \DomainException(
            'Acknowledgement receipts can only be generated for approved or released assistance requests.',
        );
    }
}
