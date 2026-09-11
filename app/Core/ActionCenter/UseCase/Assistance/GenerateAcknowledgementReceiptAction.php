<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\AcknowledgementReceiptWordingProvider;
use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptFormData;
use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;

class GenerateAcknowledgementReceiptAction
{
    public function __construct(
        private readonly BuildAssistanceFinancialDocumentContextAction $context,
        private readonly AcknowledgementReceiptWordingProvider $wording,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): AcknowledgementReceiptFormData {
        $context = $this->context->execute(
            $assistanceRequestId,
            $municipalId,
            AssistanceGeneratedDocument::AcknowledgementReceipt,
        );

        return new AcknowledgementReceiptFormData(
            assistanceRequestId: $context->assistanceRequestId,
            transactionNumber: $context->transactionNumber,
            recipientName: $context->payee,
            barangay: $context->barangay,
            approvedAmount: $context->approvedAmount,
            assistanceType: $context->assistanceType,
            submittedDate: $context->submittedAt->format('Y-m-d'),
            providedDate: $context->releasedAt?->format('Y-m-d'),
        );
    }

    public function execute(
        string $assistanceRequestId,
        string $municipalId,
    ): AcknowledgementReceiptData {
        $context = $this->context->execute(
            $assistanceRequestId,
            $municipalId,
            AssistanceGeneratedDocument::AcknowledgementReceipt,
        );
        $wording = $this->wording->for(
            $context->municipalCode,
            $context->assistanceTypeSlug,
        );

        return new AcknowledgementReceiptData(
            transactionNumber: $context->transactionNumber,
            municipalityName: $context->municipalityName,
            municipalityLogoDataUri: $context->municipalityLogoDataUri,
            recipientName: $context->payee,
            barangay: $context->barangay,
            approvedAmount: $context->approvedAmount,
            assistanceType: $context->assistanceType,
            receiptAssistanceLabel: $wording->resolvedAssistanceLabel($context->assistanceType),
            programLabel: $wording->programLabel(),
            submittedAt: $context->submittedAt,
            providedAt: $context->releasedAt,
            generatedAt: now(),
        );
    }
}
