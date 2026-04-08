<?php

namespace App\Core\Procurement\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class ProcurementComplianceException extends DomainException
{

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'PROCUREMENT_LEGAL_COMPLIANCE_ERROR';
    }

}