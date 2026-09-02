<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketData;
use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentPacketFormData;
use App\Core\ActionCenter\Dto\Assistance\GenerateFinancialDocumentPacketDto;
use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;

class GenerateFinancialDocumentPacketAction
{
    public function __construct(
        private readonly GenerateObligationRequestAction $obligationRequest,
        private readonly GenerateDisbursementVoucherAction $disbursementVoucher,
        private readonly GenerateCertificateOfEligibilityAction $certificateOfEligibility,
        private readonly ResolveFinancialDocumentPacketDocumentsAction $resolveDocuments,
    ) {}

    public function formData(
        string $assistanceRequestId,
        string $municipalId,
    ): FinancialDocumentPacketFormData {
        $documents = $this->resolveDocuments->execute($assistanceRequestId, $municipalId);
        $has = fn (AssistanceGeneratedDocument $document): bool => in_array($document, $documents, true);

        $obligationRequest = $has(AssistanceGeneratedDocument::ObligationRequest)
            ? $this->obligationRequest->formData($assistanceRequestId, $municipalId)
            : null;
        $disbursementVoucher = $has(AssistanceGeneratedDocument::DisbursementVoucher)
            ? $this->disbursementVoucher->formData($assistanceRequestId, $municipalId)
            : null;
        $certificate = $has(AssistanceGeneratedDocument::CertificateOfEligibility)
            ? $this->certificateOfEligibility->formData($assistanceRequestId, $municipalId)
            : null;

        $payee = $obligationRequest?->payee ?? $disbursementVoucher?->payee;
        $address = $obligationRequest?->address ?? $disbursementVoucher?->address;
        $assistanceType = $obligationRequest?->assistanceType ?? $disbursementVoucher?->assistanceType;
        $approvedAmount = $obligationRequest?->approvedAmount ?? $disbursementVoucher?->approvedAmount;
        $transactionNumber = $obligationRequest?->transactionNumber ?? $disbursementVoucher?->transactionNumber;

        if ($payee === null || $address === null || $assistanceType === null || $approvedAmount === null || $transactionNumber === null) {
            throw new \LogicException('A processing document packet requires at least one approved financial document.');
        }

        $obligationDefaults = $obligationRequest?->recommendedDefaults ?? [];
        $voucherDefaults = $disbursementVoucher?->recommendedDefaults ?? [];
        $certificateDefaults = $certificate?->recommendedDefaults ?? [];

        return new FinancialDocumentPacketFormData(
            assistanceRequestId: $assistanceRequestId,
            transactionNumber: $transactionNumber,
            payee: $payee,
            certificateSubject: $certificate?->subjectName,
            address: $address,
            assistanceType: $assistanceType,
            approvedAmount: $approvedAmount,
            suggestedParticulars: $obligationRequest?->suggestedParticulars ?? '',
            suggestedExplanation: $disbursementVoucher?->suggestedExplanation ?? '',
            includedDocuments: $documents,
            recommendedDefaults: [
                'obligation_request_number' => $obligationDefaults['number_prefix'] ?? '',
                'responsibility_center' => $this->firstValue(
                    $obligationDefaults['responsibility_center'] ?? '',
                    $voucherDefaults['responsibility_center_code'] ?? '',
                ),
                'account_code' => $obligationDefaults['account_code'] ?? '',
                'office' => $this->firstValue(
                    $obligationDefaults['office'] ?? '',
                    $voucherDefaults['responsibility_center_office'] ?? '',
                ),
                'fpp' => $obligationDefaults['fpp'] ?? '',
                'mswdo_printed_name' => $this->firstValue(
                    $obligationDefaults['mswdo_printed_name'] ?? '',
                    $certificateDefaults['certified_by_name'] ?? '',
                ),
                'mswdo_position' => $this->firstValue(
                    $obligationDefaults['mswdo_position'] ?? '',
                    $certificateDefaults['certified_by_position'] ?? '',
                ),
                'budget_officer_printed_name' => $obligationDefaults['budget_officer_printed_name'] ?? '',
                'budget_officer_position' => $obligationDefaults['budget_officer_position'] ?? '',
                'accountant_printed_name' => $voucherDefaults['accountant_printed_name'] ?? '',
                'accountant_position' => $voucherDefaults['accountant_position'] ?? '',
                'treasurer_printed_name' => $voucherDefaults['treasurer_printed_name'] ?? '',
                'treasurer_position' => $voucherDefaults['treasurer_position'] ?? '',
                'mayor_printed_name' => $this->firstValue(
                    $voucherDefaults['mayor_printed_name'] ?? '',
                    $certificateDefaults['approved_by_name'] ?? '',
                ),
                'mayor_position' => $this->firstValue(
                    $voucherDefaults['mayor_position'] ?? '',
                    $certificateDefaults['approved_by_position'] ?? '',
                ),
            ],
        );
    }

    public function execute(
        GenerateFinancialDocumentPacketDto $dto,
        string $generatedByUserName,
    ): FinancialDocumentPacketData {
        $documents = $this->resolveDocuments->execute(
            $dto->assistanceRequestId,
            $dto->municipalId,
        );
        $has = fn (AssistanceGeneratedDocument $document): bool => in_array($document, $documents, true);

        return new FinancialDocumentPacketData(
            certificateOfEligibility: $has(AssistanceGeneratedDocument::CertificateOfEligibility)
                ? $this->certificateOfEligibility->execute(
                    $dto->certificateOfEligibility(),
                    $generatedByUserName,
                )
                : null,
            obligationRequest: $has(AssistanceGeneratedDocument::ObligationRequest)
                ? $this->obligationRequest->execute(
                    $dto->obligationRequest(),
                    $generatedByUserName,
                )
                : null,
            disbursementVoucher: $has(AssistanceGeneratedDocument::DisbursementVoucher)
                ? $this->disbursementVoucher->execute(
                    $dto->disbursementVoucher(),
                    $generatedByUserName,
                )
                : null,
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
