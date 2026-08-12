<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class WalkInBeneficiaryIdentityDocumentStorageException extends DomainException
{
    private function __construct(
        private readonly string $beneficiaryId,
        string $message,
    ) {
        parent::__construct($message);
    }

    public static function frontUploadFailed(string $beneficiaryId): self
    {
        return new self(
            $beneficiaryId,
            'The walk-in beneficiary was saved as pending, but the front ID could not be stored. '
            .'Upload the front ID from the beneficiary profile before completing verification.',
        );
    }

    public function beneficiaryId(): string
    {
        return $this->beneficiaryId;
    }

    public function status(): int
    {
        return 503;
    }

    public function errorCode(): string
    {
        return 'WALK_IN_BENEFICIARY_ID_DOCUMENT_STORAGE_FAILED';
    }
}
