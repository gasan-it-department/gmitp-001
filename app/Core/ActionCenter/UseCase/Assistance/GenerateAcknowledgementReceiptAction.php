<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptData;
use App\Core\ActionCenter\Dto\Assistance\AcknowledgementReceiptFormData;

class GenerateAcknowledgementReceiptAction
{
    public function __construct(
        private readonly BuildAssistanceFinancialDocumentContextAction $context,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): AcknowledgementReceiptFormData {
        $context = $this->context->execute(
            $assistanceRequestId,
            $municipalId,
            'acknowledgement receipt',
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
            'acknowledgement receipt',
        );

        return new AcknowledgementReceiptData(
            transactionNumber: $context->transactionNumber,
            municipalityName: $context->municipalityName,
            municipalityLogoDataUri: $context->municipalityLogoDataUri,
            recipientName: $context->payee,
            barangay: $context->barangay,
            approvedAmount: $context->approvedAmount,
            assistanceType: $context->assistanceType,
            submittedAt: $context->submittedAt,
            providedAt: $context->releasedAt,
            generatedAt: now(),
        );
    }
}
