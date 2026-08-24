<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AcknowledgementReceiptData
{
    public function __construct(
        public string $transactionNumber,
        public string $municipalityName,
        public ?string $municipalityLogoDataUri,
        public string $recipientName,
        public string $barangay,
        public float $approvedAmount,
        public string $assistanceType,
        public \DateTimeInterface $submittedAt,
        public ?\DateTimeInterface $providedAt,
        public \DateTimeInterface $generatedAt,
    ) {}
}
