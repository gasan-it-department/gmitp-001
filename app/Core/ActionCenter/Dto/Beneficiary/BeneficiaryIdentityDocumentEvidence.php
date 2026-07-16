<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

readonly class BeneficiaryIdentityDocumentEvidence
{
    public function __construct(
        public string $side,
        public string $label,
        public string $status,
        public ?string $dataUri,
        public ?string $fileName,
        public ?string $mimeType,
        public ?string $size,
        public ?string $message,
    ) {
    }

    public function isImage(): bool
    {
        return $this->status === 'image' && $this->dataUri !== null;
    }
}
