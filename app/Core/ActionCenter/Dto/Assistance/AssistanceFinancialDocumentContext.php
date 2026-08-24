<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class AssistanceFinancialDocumentContext
{
    public function __construct(
        public string $assistanceRequestId,
        public string $transactionNumber,
        public string $municipalityName,
        public ?string $municipalCode,
        public ?string $municipalityLogoDataUri,
        public string $payee,
        public string $address,
        public string $assistanceType,
        public ?string $assistanceTypeSlug,
        public float $approvedAmount,
        public int $approvedYear,
        public ?string $assistedPerson,
    ) {}
}
