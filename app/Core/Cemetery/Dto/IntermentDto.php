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
        public string $leaseholderName,
        public ?string $leaseholderContact,
        public ?string $leaseholderAddress,
        public ?string $leaseholderRelationship,
        public string $leaseStart,
        public string $leaseEnd,
        public ?float $amountPaid,
        public ?string $orNumber,
        public ?string $leaseNotes,
    ) {}

    public static function fromRequest(array $validated): self
    {
        $intermentDate = self::normalizeDate($validated['interment_date']);
        $leaseStart = self::normalizeDate($validated['lease_start'] ?? $intermentDate);

        return new self(
            municipalId: app('municipal_id'),
            decedentId: $validated['decedent_id'],
            plotId: $validated['plot_id'],
            intermentDate: $intermentDate,
            type: $validated['type'] ?? 'initial',
            notes: self::cleanText($validated['notes'] ?? null),
            leaseholderName: self::upper($validated['leaseholder_name']),
            leaseholderContact: self::cleanText($validated['leaseholder_contact'] ?? null),
            leaseholderAddress: self::cleanText($validated['leaseholder_address'] ?? null),
            leaseholderRelationship: self::upperOrNull($validated['leaseholder_relationship'] ?? null),
            leaseStart: $leaseStart,
            leaseEnd: self::normalizeDate($validated['lease_end'] ?? Carbon::parse($leaseStart)->addYears(5)->format('Y-m-d')),
            amountPaid: filled($validated['amount_paid'] ?? null) ? (float) $validated['amount_paid'] : null,
            orNumber: self::upperOrNull($validated['or_number'] ?? null),
            leaseNotes: self::cleanText($validated['lease_notes'] ?? null),
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

    private static function upper(string $value): string
    {
        return mb_strtoupper(trim($value));
    }

    private static function upperOrNull(?string $value): ?string
    {
        $cleaned = self::cleanText($value);

        return $cleaned === null ? null : mb_strtoupper($cleaned);
    }
}
