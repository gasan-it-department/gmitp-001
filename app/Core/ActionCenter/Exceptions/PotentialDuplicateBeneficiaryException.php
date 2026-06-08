<?php

namespace App\Core\ActionCenter\Exceptions;

use Illuminate\Database\Eloquent\Collection;

/**
 * Thrown by CreateWalkInBeneficiaryAction when a walk-in being encoded matches
 * one or more existing beneficiaries on name + birth date within the same
 * municipality, and the admin has NOT yet confirmed an override (force = true).
 *
 * Carries the matching records so the controller can surface them to the admin
 * (serialized via WalkInBeneficiaryResource) for a "this is a different person —
 * register anyway" decision. This is the walk-in flow's primary duplicate
 * control, standing in for the UNIQUE(user_id) constraint that does nothing for
 * NULL-user walk-ins.
 *
 * Extends \DomainException so existing thin-controller catch blocks still treat
 * it as a domain failure; controllers that care about the matches catch this
 * subclass FIRST.
 */
class PotentialDuplicateBeneficiaryException extends \DomainException
{
    /**
     * @param  Collection<int, \App\Core\ActionCenter\Models\Beneficiary>  $matches
     */
    public function __construct(
        public readonly Collection $matches,
        string $message = 'A possible existing record was found for this person.',
    ) {
        parent::__construct($message);
    }
}
