<?php

namespace App\Core\Cemetery\Dto\Sites;

final readonly class UpdateCemeterySiteDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $name,
        public ?string $psgcBarangayCode,
        public ?string $streetName,
        public ?string $notes,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            name: mb_strtoupper(trim($data['name'])),
            psgcBarangayCode: self::clean($data['psgc_barangay_code'] ?? null),
            streetName: self::upper($data['street_name'] ?? null),
            notes: self::clean($data['notes'] ?? null),
        );
    }

    private static function upper(?string $value): ?string
    {
        $clean = self::clean($value);

        return $clean === null ? null : mb_strtoupper($clean);
    }

    private static function clean(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
