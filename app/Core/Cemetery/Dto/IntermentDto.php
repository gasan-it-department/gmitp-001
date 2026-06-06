<?php

namespace App\Core\Cemetery\Dto;

use Carbon\Carbon;

/**
 * Immutable transport for "record interment" — one interment EVENT (initial OR
 * transfer). The plot_id MUST reference a LEAF/SLOT row (BR-4); the
 * RecordIntermentAction enforces this defensively and the assignment picker
 * pre-filters parent containers out (BR-1).
 *
 * Tenancy (SR-1): `municipalId` is sourced from `app('municipal_id')` —
 * bound by SetMunicipalityContext — and never from the payload. `notes` are
 * free-form prose, so they are trimmed but NOT uppercased (SR-3 applies only
 * to identifier fields).
 */
final readonly class IntermentDto
{
    public function __construct(
        public string  $municipalId,
        public string  $decedentId,
        public string  $plotId,
        public string  $intermentDate, // normalized 'Y-m-d'
        public string  $type,          // 'initial' | 'transfer'
        public ?string $notes,
    ) {
    }

    public static function fromRequest(array $validated): self
    {
        return new self(
            municipalId: app('municipal_id'),
            decedentId: $validated['decedent_id'],
            plotId: $validated['plot_id'],
            intermentDate: self::normalizeDate($validated['interment_date']),
            type: $validated['type'] ?? 'initial',
            notes: self::cleanText($validated['notes'] ?? null),
        );
    }

    /**
     * Coerce any accepted input shape (Y-m-d, m/d/Y, ISO 8601) to the
     * canonical Y-m-d string so the column behaves identically across DB
     * drivers and downstream reads are predictable.
     */
    private static function normalizeDate(string $value): string
    {
        return Carbon::parse($value)->format('Y-m-d');
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
