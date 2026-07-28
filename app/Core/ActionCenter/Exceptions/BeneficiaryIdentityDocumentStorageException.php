<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class BeneficiaryIdentityDocumentStorageException extends DomainException
{
    private function __construct(
        string $message,
        private readonly int $httpStatus,
    ) {
        parent::__construct($message);
    }

    public static function requiredFrontMissing(): self
    {
        return new self(
            'Your beneficiary profile was saved, but its front ID is still missing. '
            .'Please upload the front of your valid ID and submit the profile again.',
            422,
        );
    }

    public static function frontUploadFailed(): self
    {
        return new self(
            'Your beneficiary profile was saved, but the front ID could not be stored. '
            .'Please submit the profile again to retry the ID upload.',
            503,
        );
    }

    public function status(): int
    {
        return $this->httpStatus;
    }

    public function errorCode(): string
    {
        return 'BENEFICIARY_ID_DOCUMENT_STORAGE_FAILED';
    }
}
