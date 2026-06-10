<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\StoreAssistanceTypeRequest;

readonly class StoreAssistanceTypeDto
{
    public function __construct(
        public string $name,
        public ?string $description,
        public float $minAmount,
        public ?float $maxAmount,
        public int $cooldownMonths,
        public bool $isActive,
        public array $documents = [],
    ) {
    }

    public static function fromRequest(StoreAssistanceTypeRequest $request)
    {
        $validated = $request->validated();

        return new self(
            name: strtoupper($validated['name']),
            description: $validated['description'] ?? null,
            minAmount: isset($validated['min_amount']) ? (float) $validated['min_amount'] : 0.0,
            maxAmount: isset($validated['max_amount']) ? (float) $validated['max_amount'] : null,
            cooldownMonths: $validated['cooldown_months'],
            isActive: (bool) $validated['is_active'],
            documents: $validated['documents'] ?? [],
        );
    }
}
