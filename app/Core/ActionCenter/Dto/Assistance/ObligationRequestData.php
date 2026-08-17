<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class ObligationRequestData
{
    public function __construct(
        public string $transactionNumber,
        public string $municipalityName,
        public ?string $municipalityLogoDataUri,
        public string $payee,
        public string $address,
        public string $assistanceType,
        public float $approvedAmount,
        public string $obligationRequestNumber,
        public string $responsibilityCenter,
        public string $accountCode,
        public string $particulars,
        public string $mswdoPrintedName,
        public string $mswdoPosition,
        public string $budgetOfficerPrintedName,
        public string $budgetOfficerPosition,
        public ?string $office,
        public ?string $fpp,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
    ) {}
}
