<?php

namespace App\Core\Cemetery\Dto\Plots;

use Carbon\Carbon;

final readonly class UpdatePlotLeaseDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $plotId,
        public string $leaseholderName,
        public ?string $leaseholderContact,
        public ?string $leaseholderAddress,
        public ?string $leaseholderRelationship,
        public ?string $leaseStart,
        public ?string $leaseEnd,
        public ?float $amountPaid,
        public ?string $orNumber,
        public ?string $notes,
    ) {}

    public static function fromRequest(array $validated, string $cemeterySiteId, string $plotId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            plotId: $plotId,
            leaseholderName: mb_strtoupper(trim($validated['leaseholder_name'])),
            leaseholderContact: self::cleanText($validated['leaseholder_contact'] ?? null),
            leaseholderAddress: self::cleanText($validated['leaseholder_address'] ?? null),
            leaseholderRelationship: self::upperOrNull($validated['leaseholder_relationship'] ?? null),
            leaseStart: self::dateOrNull($validated['lease_start'] ?? null),
            leaseEnd: self::dateOrNull($validated['lease_end'] ?? null),
            amountPaid: filled($validated['amount_paid'] ?? null) ? (float) $validated['amount_paid'] : null,
            orNumber: self::upperOrNull($validated['or_number'] ?? null),
            notes: self::cleanText($validated['notes'] ?? null),
        );
    }

    private static function dateOrNull(?string $value): ?string
    {
        return filled($value) ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    private static function cleanText(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }

    private static function upperOrNull(?string $value): ?string
    {
        $cleaned = self::cleanText($value);

        return $cleaned === null ? null : mb_strtoupper($cleaned);
    }
}
