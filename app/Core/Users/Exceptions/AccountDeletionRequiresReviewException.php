<?php

namespace App\Core\Users\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class AccountDeletionRequiresReviewException extends DomainException
{
    public function __construct()
    {
        parent::__construct('Account deletion requires administrative review.');
    }

    public function status(): int
    {
        return 409;
    }

    public function errorCode(): string
    {
        return 'USER_ACCOUNT_DELETION_REQUIRES_REVIEW';
    }
}
