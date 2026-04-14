<?php

namespace App\Core\Procurement\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class ProcurementDomainException extends DomainException
{

    public function errorCode(): string
    {
        return 'PROCUREMENT_EXCEPTION';
    }
    public function status(): int
    {
        return 404;
    }

}