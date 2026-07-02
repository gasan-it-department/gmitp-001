<?php

namespace App\Core\Cemetery\Dto\Interments;

use Carbon\Carbon;

final readonly class MoveIntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $intermentId,
        public string $destinationCemeterySiteId,
        public string $destinationPlotId,
        public string $movementDate,
        public string $reason,
        public ?string $notes,
    ) {}

    public static function fromRequest(string $intermentId, array $validated): self
    {
        return new self(
            municipalId: app('municipal_id'),
            intermentId: $intermentId,
            destinationCemeterySiteId: $validated['destination_cemetery_site_id'],
            destinationPlotId: $validated['destination_plot_id'],
            movementDate: Carbon::parse($validated['movement_date'])->format('Y-m-d'),
            reason: trim($validated['reason']),
            notes: self::cleanText($validated['notes'] ?? null),
        );
    }

    private static function cleanText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
