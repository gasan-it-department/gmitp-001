<?php

namespace App\Core\Cemetery\Dto;

use Carbon\Carbon;

/**
 * Immutable transport for recording one interment event. Plot assignability is
 * enforced by RecordIntermentAction using the plot occupancy mode and capacity.
 */
final readonly class IntermentDto
{
    public function __construct(
        public string $municipalId,
        public string $decedentId,
        public string $plotId,
        public string $intermentDate,
        public string $type,
        public ?string $notes,
        public ?string $pendingDocumentReason,
        public ?string $pendingDocumentReference,
        public bool $pendingDocumentConfirmed,
    ) {}

    public static function fromRequest(array $validated): self
    {
        $intermentDate = self::normalizeDate($validated['interment_date']);

        return new self(
            municipalId: app('municipal_id'),
            decedentId: $validated['decedent_id'],
            plotId: $validated['plot_id'],
            intermentDate: $intermentDate,
            type: $validated['type'] ?? 'initial',
            notes: self::cleanText($validated['notes'] ?? null),
            pendingDocumentReason: self::cleanText($validated['pending_document_reason'] ?? null),
            pendingDocumentReference: self::cleanText($validated['pending_document_reference'] ?? null),
            pendingDocumentConfirmed: (bool) ($validated['pending_document_confirmed'] ?? false),
        );
    }

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
