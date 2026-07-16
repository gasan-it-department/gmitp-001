<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Support\Collection;

readonly class AssistanceRequestIntakeSheetData
{
    public function __construct(
        public AssistanceRequest $request,
        /** @var Collection<int, \App\Core\ActionCenter\Models\HouseholdMember> */
        public Collection $householdMembers,
        public ?string $municipalityName,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
    ) {
    }
}
