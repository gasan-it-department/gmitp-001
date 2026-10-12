<?php

namespace App\Core\ActionCenter\Dto\Household;

final readonly class UpdateHouseholdAddressDto
{
    public function __construct(
        public string $householdId,
        public string $municipalId,
        public string $actingAdminId,
        public string $barangayCode,
        public ?string $street,
        public string $reason,
        public string $expectedFingerprint,
    ) {}
}
