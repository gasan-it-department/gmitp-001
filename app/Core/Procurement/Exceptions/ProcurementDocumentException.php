<?php

namespace App\Core\Procurement\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class ProcurementDocumentException extends DomainException
{

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'DOCUMENT_VIOLATION';
    }

    public static function limitExceeded(int $limit): self
    {
        return new self(
            "A procurement can only have a maximum of {$limit} documents attached."
        );
    }

    public static function fileTooLarge(int $maxMb): self
    {
        return new self(
            "The uploaded file exceeds the maximum allowed size of {$maxMb}MB."
        );
    }

    // Invalid file type
    public static function invalidFileType(string $allowedTypes): self
    {
        return new self(
            "Invalid file type. Allowed types are: {$allowedTypes}."
        );
    }

    // Duplicate document
    public static function duplicateDocument(string $filename): self
    {
        return new self(
            "A document named '{$filename}' has already been attached to this procurement."
        );
    }

    public static function invalidTypeForStatus(string $documentLabel, string $status): self
    {
        return new self("Action Denied: You cannot upload a '{$documentLabel}' while the project is in the '{$status}' phase.");
    }

}