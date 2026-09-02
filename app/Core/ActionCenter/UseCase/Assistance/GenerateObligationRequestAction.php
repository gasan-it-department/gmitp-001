<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\FinancialDocumentDefaultsProvider;
use App\Core\ActionCenter\Dto\Assistance\AssistanceFinancialDocumentContext;
use App\Core\ActionCenter\Dto\Assistance\GenerateObligationRequestDto;
use App\Core\ActionCenter\Dto\Assistance\ObligationRequestData;
use App\Core\ActionCenter\Dto\Assistance\ObligationRequestFormData;
use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;

class GenerateObligationRequestAction
{
    public function __construct(
        private readonly BuildAssistanceFinancialDocumentContextAction $context,
        private readonly FinancialDocumentDefaultsProvider $defaults,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): ObligationRequestFormData {
        $context = $this->context->execute(
            $assistanceRequestId,
            $municipalId,
            AssistanceGeneratedDocument::ObligationRequest,
        );

        return new ObligationRequestFormData(
            assistanceRequestId: $context->assistanceRequestId,
            transactionNumber: $context->transactionNumber,
            payee: $context->payee,
            address: $context->address,
            assistanceType: $context->assistanceType,
            approvedAmount: $context->approvedAmount,
            suggestedParticulars: $this->suggestedParticulars($context),
            recommendedDefaults: $this->defaults
                ->for($context->municipalCode, $context->assistanceTypeSlug)
                ->obligationRequest(),
        );
    }

    public function execute(
        GenerateObligationRequestDto $dto,
        string $generatedByUserName,
    ): ObligationRequestData {
        $context = $this->context->execute(
            $dto->assistanceRequestId,
            $dto->municipalId,
            AssistanceGeneratedDocument::ObligationRequest,
        );

        return new ObligationRequestData(
            transactionNumber: $context->transactionNumber,
            municipalityName: $context->municipalityName,
            municipalityLogoDataUri: $context->municipalityLogoDataUri,
            payee: $context->payee,
            address: $context->address,
            assistanceType: $context->assistanceType,
            approvedAmount: $context->approvedAmount,
            obligationRequestNumber: $dto->obligationRequestNumber,
            responsibilityCenter: $dto->responsibilityCenter,
            accountCode: $dto->accountCode,
            particulars: $dto->particulars,
            mswdoPrintedName: $dto->mswdoPrintedName,
            mswdoPosition: $dto->mswdoPosition,
            budgetOfficerPrintedName: $dto->budgetOfficerPrintedName,
            budgetOfficerPosition: $dto->budgetOfficerPosition,
            office: $dto->office,
            fpp: $dto->fpp,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    private function suggestedParticulars(
        AssistanceFinancialDocumentContext $context,
    ): string {
        $lines = [
            'Payment for '.$context->assistanceType,
        ];

        if ($context->assistedPerson !== null) {
            $lines[] = 'For: '.$context->assistedPerson;
        }

        $lines[] = 'RE: Aid/Assistance to Individual in Crisis';
        $lines[] = sprintf('Situation (AICS) CY %d', $context->approvedYear);

        return implode("\n", $lines);
    }
}
