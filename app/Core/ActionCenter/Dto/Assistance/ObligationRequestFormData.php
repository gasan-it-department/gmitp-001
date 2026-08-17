<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class ObligationRequestFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $payee,
        public string $address,
        public string $assistanceType,
        public float $approvedAmount,
        public string $suggestedParticulars,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'payee' => $this->payee,
            'address' => $this->address,
            'assistance_type' => $this->assistanceType,
            'approved_amount' => $this->approvedAmount,
            'suggested_particulars' => $this->suggestedParticulars,
        ];
    }
}
