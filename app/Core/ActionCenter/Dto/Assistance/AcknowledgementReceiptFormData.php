<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AcknowledgementReceiptFormData
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $recipientName,
        public string $barangay,
        public float $approvedAmount,
        public string $assistanceType,
        public string $submittedDate,
        public ?string $providedDate,
    ) {}

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'assistance_request_id' => $this->assistanceRequestId,
            'transaction_number' => $this->transactionNumber,
            'recipient_name' => $this->recipientName,
            'barangay' => $this->barangay,
            'approved_amount' => $this->approvedAmount,
            'assistance_type' => $this->assistanceType,
            'submitted_date' => $this->submittedDate,
            'provided_date' => $this->providedDate,
        ];
    }
}
