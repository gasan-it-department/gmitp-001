<?php

namespace App\Core\Government\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;


class OfficialAlreadyAppointedException extends DomainException
{

    public function __construct(
        string $message = "This official is already assigned to this term."
    ) {
        parent::__construct($message);
    }

    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'OFFICIAL_ALREADY_APPOINTED';
    }

}