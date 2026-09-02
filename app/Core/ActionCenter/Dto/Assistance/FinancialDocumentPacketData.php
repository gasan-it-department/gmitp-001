<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class FinancialDocumentPacketData
{
    public function __construct(
        public ?CertificateOfEligibilityData $certificateOfEligibility,
        public ?ObligationRequestData $obligationRequest,
        public ?DisbursementVoucherData $disbursementVoucher,
    ) {}

    public function transactionNumber(): string
    {
        return $this->certificateOfEligibility?->transactionNumber
            ?? $this->obligationRequest?->transactionNumber
            ?? $this->disbursementVoucher?->transactionNumber
            ?? throw new \LogicException('A financial document packet cannot be empty.');
    }

    public function generatedAt(): \DateTimeInterface
    {
        return $this->certificateOfEligibility?->generatedAt
            ?? $this->obligationRequest?->generatedAt
            ?? $this->disbursementVoucher?->generatedAt
            ?? throw new \LogicException('A financial document packet cannot be empty.');
    }
}
