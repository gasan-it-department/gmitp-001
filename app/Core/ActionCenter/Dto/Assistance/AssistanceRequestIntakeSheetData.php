<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Support\Collection;

readonly class AssistanceRequestIntakeSheetData
{
    public function __construct(
        public AssistanceRequest $request,
        /** @var Collection<int, AssistanceRequestHouseholdMemberData> */
        public Collection $householdMembers,
        public ?\DateTimeInterface $householdCompositionCapturedAt,
        public bool $usesCurrentHouseholdFallback,
        public ?string $municipalityName,
        public ?string $municipalityLogoDataUri,
        /** @var list<string> */
        public array $problemPresented,
        public string $sourceOfIncome,
        public float $monthlyIncome,
        public string $recommendation,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
    ) {}
}
