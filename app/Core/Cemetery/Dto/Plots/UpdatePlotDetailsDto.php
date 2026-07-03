<?php

namespace App\Core\Cemetery\Dto\Plots;

final readonly class UpdatePlotDetailsDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $plotId,
        public string $name,
        public string $type,
        public ?string $areaSqm,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId, string $plotId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            plotId: $plotId,
            name: mb_strtoupper(trim($validated['name'])),
            type: $validated['type'],
            areaSqm: self::decimalString($validated['area_sqm'] ?? null),
        );
    }

    private static function decimalString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        return number_format((float) $value, 2, '.', '');
    }
}
