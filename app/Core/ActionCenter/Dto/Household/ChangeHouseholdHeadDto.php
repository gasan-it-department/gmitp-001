<?php

namespace App\Core\ActionCenter\Dto\Household;

use App\Core\ActionCenter\Enums\HeadDepartureDisposition;

final readonly class ChangeHouseholdHeadDto
{
    public function __construct(
        public string $householdId,
        public string $municipalId,
        public string $actingAdminId,
        public ?string $successorMemberId,
        public ?HeadDepartureDisposition $currentHeadDisposition,
        public ?string $formerHeadRelationship,
        public string $reason,
    ) {}
}
