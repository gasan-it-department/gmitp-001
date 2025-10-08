<?php

namespace App\Shared\Contracts;

/**
 * Contract for any service responsible for generating unique identifiers.
 * This contract is what all application services and repositories will depend on.
 */
interface IdGeneratorInterface
{
    /**
     * Generates and returns a globally unique identifier as a string.
     * @return string
     */
    public function generate(): string;
}
