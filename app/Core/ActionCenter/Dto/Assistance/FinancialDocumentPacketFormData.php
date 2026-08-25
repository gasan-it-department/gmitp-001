<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class FinancialDocumentPacketFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $payee,
        public string $certificateSubject,
        public string $address,
        public string $assistanceType,
        public float $approvedAmount,
        public string $suggestedParticulars,
        public string $suggestedExplanation,
        /** @var array<string, string> */
        public array $recommendedDefaults,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'payee' => $this->payee,
            'certificate_subject' => $this->certificateSubject,
            'address' => $this->address,
            'assistance_type' => $this->assistanceType,
            'approved_amount' => $this->approvedAmount,
            'suggested_particulars' => $this->suggestedParticulars,
            'suggested_explanation' => $this->suggestedExplanation,
            'recommended_defaults' => $this->recommendedDefaults,
        ];
    }
}
