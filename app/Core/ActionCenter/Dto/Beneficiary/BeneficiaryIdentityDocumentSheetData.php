<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;

readonly class BeneficiaryIdentityDocumentSheetData
{
    public function __construct(
        public Beneficiary $beneficiary,
        public ?string $municipalityName,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
        public BeneficiaryIdentityDocumentEvidence $frontDocument,
        public BeneficiaryIdentityDocumentEvidence $backDocument,
    ) {
    }
}
