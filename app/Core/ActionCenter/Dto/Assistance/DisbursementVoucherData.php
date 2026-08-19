<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class DisbursementVoucherData
{
    public function __construct(
        public string $transactionNumber,
        public string $municipalityName,
        public ?string $municipalityLogoDataUri,
        public string $payee,
        public string $address,
        public string $assistanceType,
        public float $approvedAmount,
        public ?string $disbursementVoucherNumber,
        public string $modeOfPayment,
        public ?string $tinEmployeeNumber,
        public string $obligationRequestNumber,
        public ?string $responsibilityCenterOffice,
        public string $responsibilityCenterCode,
        public string $explanation,
        public string $accountantPrintedName,
        public string $accountantPosition,
        public string $treasurerPrintedName,
        public string $treasurerPosition,
        public string $mayorPrintedName,
        public string $mayorPosition,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
    ) {}
}
