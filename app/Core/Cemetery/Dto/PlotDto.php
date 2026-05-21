<?php

namespace App\Core\Cemetery\Dto;

use App\External\Api\Request\Cemetery\CreatePlotRequest;

/**
 * Immutable transport for "create new plot" data.
 *
 * municipal_id is sourced from the request context, never from the payload.
 */
final readonly class PlotDto
{
    public function __construct(
        public string  $municipalId,
        public string  $sectionId,
        public string  $type,
        public string  $status,
        public ?string $plotNumber,
        public ?string $name,
        public ?int    $totalCapacity,
    ) {
    }

    public static function fromCreateRequest(CreatePlotRequest $request): self
    {
        $data = $request->validated();

        return new self(
            municipalId: app('municipal_id'),
            sectionId: $data['section_id'],
            type: $data['type'],
            status: $data['status'] ?? 'available',
            plotNumber: self::upper($data['plot_number'] ?? null),
            name: self::upper($data['name'] ?? null),
            totalCapacity: isset($data['total_capacity']) ? (int) $data['total_capacity'] : null,
        );
    }

    private static function upper(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : strtoupper($trimmed);
    }
}
