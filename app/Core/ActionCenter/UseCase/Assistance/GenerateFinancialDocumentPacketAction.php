<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketData;
use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketFormData;
use App\Core\ActionCenter\Dto\Assistance\GenerateFinancialDocumentPacketDto;

class GenerateFinancialDocumentPacketAction
{
    public function __construct(
        private readonly GenerateObligationRequestAction $obligationRequest,
        private readonly GenerateDisbursementVoucherAction $disbursementVoucher,
        private readonly GenerateCertificateOfEligibilityAction $certificateOfEligibility,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): FinancialDocumentPacketFormData {
        $obligationRequest = $this->obligationRequest->formData(
            $assistanceRequestId,
            $municipalId,
        );
        $disbursementVoucher = $this->disbursementVoucher->formData(
            $assistanceRequestId,
            $municipalId,
        );
        $certificate = $this->certificateOfEligibility->formData(
            $assistanceRequestId,
            $municipalId,
        );

        return new FinancialDocumentPacketFormData(
            assistanceRequestId: $obligationRequest->assistanceRequestId,
            transactionNumber: $obligationRequest->transactionNumber,
            payee: $obligationRequest->payee,
            certificateSubject: $certificate->subjectName,
            address: $obligationRequest->address,
            assistanceType: $obligationRequest->assistanceType,
            approvedAmount: $obligationRequest->approvedAmount,
            suggestedParticulars: $obligationRequest->suggestedParticulars,
            suggestedExplanation: $disbursementVoucher->suggestedExplanation,
            recommendedDefaults: [
                'obligation_request_number' => $obligationRequest->recommendedDefaults['number_prefix'] ?? '',
                'responsibility_center' => $this->firstValue(
                    $obligationRequest->recommendedDefaults['responsibility_center'] ?? '',
                    $disbursementVoucher->recommendedDefaults['responsibility_center_code'] ?? '',
                ),
                'account_code' => $obligationRequest->recommendedDefaults['account_code'] ?? '',
                'office' => $this->firstValue(
                    $obligationRequest->recommendedDefaults['office'] ?? '',
                    $disbursementVoucher->recommendedDefaults['responsibility_center_office'] ?? '',
                ),
                'fpp' => $obligationRequest->recommendedDefaults['fpp'] ?? '',
                'mswdo_printed_name' => $this->firstValue(
                    $obligationRequest->recommendedDefaults['mswdo_printed_name'] ?? '',
                    $certificate->recommendedDefaults['certified_by_name'] ?? '',
                ),
                'mswdo_position' => $this->firstValue(
                    $obligationRequest->recommendedDefaults['mswdo_position'] ?? '',
                    $certificate->recommendedDefaults['certified_by_position'] ?? '',
                ),
                'budget_officer_printed_name' => $obligationRequest->recommendedDefaults['budget_officer_printed_name'] ?? '',
                'budget_officer_position' => $obligationRequest->recommendedDefaults['budget_officer_position'] ?? '',
                'accountant_printed_name' => $disbursementVoucher->recommendedDefaults['accountant_printed_name'] ?? '',
                'accountant_position' => $disbursementVoucher->recommendedDefaults['accountant_position'] ?? '',
                'treasurer_printed_name' => $disbursementVoucher->recommendedDefaults['treasurer_printed_name'] ?? '',
                'treasurer_position' => $disbursementVoucher->recommendedDefaults['treasurer_position'] ?? '',
                'mayor_printed_name' => $this->firstValue(
                    $disbursementVoucher->recommendedDefaults['mayor_printed_name'] ?? '',
                    $certificate->recommendedDefaults['approved_by_name'] ?? '',
                ),
                'mayor_position' => $this->firstValue(
                    $disbursementVoucher->recommendedDefaults['mayor_position'] ?? '',
                    $certificate->recommendedDefaults['approved_by_position'] ?? '',
                ),
            ],
        );
    }

    public function execute(
        GenerateFinancialDocumentPacketDto $dto,
        string $generatedByUserName,
    ): FinancialDocumentPacketData {
        return new FinancialDocumentPacketData(
            certificateOfEligibility: $this->certificateOfEligibility->execute(
                $dto->certificateOfEligibility(),
                $generatedByUserName,
            ),
            obligationRequest: $this->obligationRequest->execute(
                $dto->obligationRequest(),
                $generatedByUserName,
            ),
            disbursementVoucher: $this->disbursementVoucher->execute(
                $dto->disbursementVoucher(),
                $generatedByUserName,
            ),
        );
    }

    private function firstValue(string ...$values): string
    {
        foreach ($values as $value) {
            if (trim($value) !== '') {
                return $value;
            }
        }

        return '';
    }
}
