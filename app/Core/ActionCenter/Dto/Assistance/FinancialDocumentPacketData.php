<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class FinancialDocumentPacketData
{
    public function __construct(
        public CertificateOfEligibilityData $certificateOfEligibility,
        public ObligationRequestData $obligationRequest,
        public DisbursementVoucherData $disbursementVoucher,
    ) {}

    public function transactionNumber(): string
    {
        return $this->obligationRequest->transactionNumber;
    }

    public function generatedAt(): \DateTimeInterface
    {
        return $this->obligationRequest->generatedAt;
    }
}
