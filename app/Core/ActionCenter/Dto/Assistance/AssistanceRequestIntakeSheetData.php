<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;

readonly class AssistanceRequestIntakeSheetData
{
    public function __construct(
        public AssistanceRequest $request,
        public ?string $municipalityName,
        public string $generatedByUserName,
        public \DateTimeInterface $generatedAt,
    ) {
    }
}
