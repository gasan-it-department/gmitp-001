<?php

namespace App\Core\Municipality\Exceptions;

use DomainException;

class MunicipalityValidationException extends DomainException
{
    public function __construct(
        protected array $errors
    ) {
        parent::__construct('Municipality validation failed');
    }
    public function getErrors(): array
    {
        return $this->errors;
    }
}
