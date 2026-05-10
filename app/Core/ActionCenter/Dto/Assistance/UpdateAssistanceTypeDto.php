<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\UpdateAssistanceTypeRequest;

readonly class UpdateAssistanceTypeDto
{
    public function __construct(
        public string $name,
        public string $description,
        public float $maxAmount,
        public int $cooldownMonths,
        public bool $isActive,
        public array $documents,
    ) {
    }

    public static function fromRequest(UpdateAssistanceTypeRequest $request)
    {
        $validated = $request->validated();

        return new self(
            name: strtoupper($validated['name']),
            description: $validated['description'],
            maxAmount: $validated['max_amount'],
            cooldownMonths: $validated['cooldown_months'],
            isActive: (bool) $validated['is_active'],
            documents: $validated['documents'] ?? [],
        );
    }
}


