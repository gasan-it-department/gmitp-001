<?php

namespace App\Core\ActionCenter\Exceptions;

use App\Shared\Exceptions\Interfaces\DomainException;

class HouseholdMemberDeclarationException extends DomainException
{
    public static function profileNotVerified(): self
    {
        return new self('Your beneficiary profile must be verified before adding a household member.');
    }

    public static function beneficiaryInactive(): self
    {
        return new self('Your beneficiary profile is inactive. Please visit the MSWD office.');
    }

    public static function householdNotVerified(): self
    {
        return new self('Your household must have a verified head before adding a household member.');
    }

    public static function pendingMemberExists(): self
    {
        return new self(
            'You already have a newly declared household member awaiting MSWD verification. '
            .'Only one unresolved member may be added at a time.',
        );
    }

    public static function invalidRelationship(): self
    {
        return new self('A citizen-declared household member cannot be assigned as the head of household.');
    }

    public function status(): int
    {
        return 422;
    }

    public function errorCode(): string
    {
        return 'HOUSEHOLD_MEMBER_DECLARATION_REJECTED';
    }
}
