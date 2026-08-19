<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use Carbon\CarbonImmutable;

readonly class CertificateOfEligibilityData
{
    public function __construct(
        public string $transactionNumber,
        public string $municipalityName,
        public ?string $provinceName,
        public ?string $trunklinePhone,
        public ?string $municipalityLogoDataUri,
        public string $subjectName,
        public ?string $subjectAgePhrase,
        public ?string $subjectCivilStatus,
        public string $address,
        public string $assistanceType,
        public CarbonImmutable $intakeDate,
        public string $certifiedByName,
        public string $certifiedByPosition,
        public string $approvedByName,
        public string $approvedByPosition,
        public string $generatedByUserName,
        public CarbonImmutable $generatedAt,
    ) {}
}
