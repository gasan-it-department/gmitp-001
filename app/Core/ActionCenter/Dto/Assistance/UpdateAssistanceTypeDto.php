<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\UpdateAssistanceTypeRequest;

readonly class UpdateAssistanceTypeDto
{
    public function __construct(
        public string $name,
        public string $description,
        public float $minAmount,
        public ?float $maxAmount,
        public int $cooldownMonths,
        public bool $isActive,
        public array $documents,
        public ?array $enabledGeneratedDocuments = null,
    ) {}

    public static function fromRequest(UpdateAssistanceTypeRequest $request)
    {
        $validated = $request->validated();

        return new self(
            name: strtoupper($validated['name']),
            description: $validated['description'],
            minAmount: isset($validated['min_amount']) ? (float) $validated['min_amount'] : 0.0,
            maxAmount: isset($validated['max_amount']) ? (float) $validated['max_amount'] : null,
            cooldownMonths: $validated['cooldown_months'],
            isActive: (bool) $validated['is_active'],
            documents: $validated['documents'] ?? [],
            enabledGeneratedDocuments: array_key_exists('enabled_generated_documents', $validated)
                ? $validated['enabled_generated_documents']
                : null,
        );
    }
}
