<?php

namespace App\Core\Municipality\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class MunicipalityValidationException extends DomainException
{

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'MUNICIPALITY_ERROR_EXCEPTION';
    }

}
