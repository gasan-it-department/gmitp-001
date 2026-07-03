<?php

namespace App\Core\Cemetery\Dto\Interments;

final readonly class CloseIntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $intermentId,
        public string $endType,
        public string $endedDate,
        public string $reason,
        public ?string $notes,
        public ?string $permitReference,
        public ?string $transferDestination,
    ) {}

    public static function fromRequest(string $intermentId, array $validated): self
    {
        return new self(
            municipalId: app('municipal_id'),
            intermentId: $intermentId,
            endType: $validated['end_type'],
            endedDate: $validated['ended_date'],
            reason: trim($validated['reason']),
            notes: self::trimNullable($validated['notes'] ?? null),
            permitReference: self::upperNullable($validated['permit_reference'] ?? null),
            transferDestination: self::trimNullable($validated['transfer_destination'] ?? null),
        );
    }

    private static function trimNullable(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function upperNullable(?string $value): ?string
    {
        $trimmed = self::trimNullable($value);

        return $trimmed === null ? null : mb_strtoupper($trimmed);
    }
}
