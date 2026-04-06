<?php

namespace App\Core\Procurement\Exceptions;

use App\Core\Procurement\Enums\ProcurementStatus;
use App\Shared\Exceptions\Interfaces\DomainException;

class InvalidProcurementStateException extends DomainException
{
    public static function alreadyOpen(): self
    {
        return new self("This procurement is already open and visible to the public.");
    }

    public static function cannotOpen(ProcurementStatus $currentStatus): self
    {
        return new self("Cannot open a procurement that is currently {$currentStatus->label()}.");
    }

    public function status(): int
    {
        return 422;

    }
    public function errorCode(): string
    {
        return 'PROCUREMENT_INVALID_STATE';
    }
}