<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceFinancialDocumentContext;
use App\Core\ActionCenter\Dto\Assistance\DisbursementVoucherData;
use App\Core\ActionCenter\Dto\Assistance\DisbursementVoucherFormData;
use App\Core\ActionCenter\Dto\Assistance\GenerateDisbursementVoucherDto;
use App\Core\ActionCenter\Services\PhilippinePesoInWordsFormatter;

class GenerateDisbursementVoucherAction
{
    public function __construct(
        private readonly BuildAssistanceFinancialDocumentContextAction $context,
        private readonly PhilippinePesoInWordsFormatter $pesoInWords,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): DisbursementVoucherFormData {
        $context = $this->context->execute(
            $assistanceRequestId,
            $municipalId,
            'disbursement voucher',
        );

        return new DisbursementVoucherFormData(
            assistanceRequestId: $context->assistanceRequestId,
            transactionNumber: $context->transactionNumber,
            payee: $context->payee,
            address: $context->address,
            assistanceType: $context->assistanceType,
            approvedAmount: $context->approvedAmount,
            suggestedExplanation: $this->suggestedExplanation($context),
        );
    }

    public function execute(
        GenerateDisbursementVoucherDto $dto,
        string $generatedByUserName,
    ): DisbursementVoucherData {
        $context = $this->context->execute(
            $dto->assistanceRequestId,
            $dto->municipalId,
            'disbursement voucher',
        );

        return new DisbursementVoucherData(
            transactionNumber: $context->transactionNumber,
            municipalityName: $context->municipalityName,
            municipalityLogoDataUri: $context->municipalityLogoDataUri,
            payee: $context->payee,
            address: $context->address,
            assistanceType: $context->assistanceType,
            approvedAmount: $context->approvedAmount,
            disbursementVoucherNumber: $dto->disbursementVoucherNumber,
            modeOfPayment: $dto->modeOfPayment,
            tinEmployeeNumber: $dto->tinEmployeeNumber,
            obligationRequestNumber: $dto->obligationRequestNumber,
            responsibilityCenterOffice: $dto->responsibilityCenterOffice,
            responsibilityCenterCode: $dto->responsibilityCenterCode,
            explanation: $dto->explanation,
            accountantPrintedName: $dto->accountantPrintedName,
            accountantPosition: $dto->accountantPosition,
            treasurerPrintedName: $dto->treasurerPrintedName,
            treasurerPosition: $dto->treasurerPosition,
            mayorPrintedName: $dto->mayorPrintedName,
            mayorPosition: $dto->mayorPosition,
            generatedByUserName: $generatedByUserName,
            generatedAt: now(),
        );
    }

    private function suggestedExplanation(
        AssistanceFinancialDocumentContext $context,
    ): string {
        $lines = [
            'Payment for '.$context->assistanceType,
        ];

        if ($context->assistedPerson !== null) {
            $lines[] = 'For: '.$context->assistedPerson;
        }

        $lines[] = sprintf(
            'RE: Aid/Assistance to Individual in Crisis Situation (AICS) CY %d, as per supporting papers hereto attached amounting to',
            $context->approvedYear,
        );
        $lines[] = $this->pesoInWords->format($context->approvedAmount);

        return implode("\n", $lines);
    }
}
