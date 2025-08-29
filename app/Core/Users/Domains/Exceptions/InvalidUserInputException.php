<?php

namespace App\Core\Users\Domains\Exceptions;

use DomainException;

class InvalidUserInputException extends DomainException
{
    public function __construct(
        private string $field,
        string $message,
    ) {
        parent::__construct($message);
    }

    public function getField(): string
    {
        return $this->field;
    }
}