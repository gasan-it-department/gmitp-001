<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class AssistanceTypeException extends DomainException
{
    public static function duplicateSlug(string $name): self
    {
        return new self(sprintf(
            'An assistance type named "%s" already exists in this municipality.',
            $name,
        ));
    }

    public static function invalidSlug(): self
    {
        return new self('The assistance type name must contain letters or numbers.');
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'ASSISTANCE_TYPE_CONFLICT';
    }
}
