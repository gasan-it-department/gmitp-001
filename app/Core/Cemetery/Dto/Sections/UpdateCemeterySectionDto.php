<?php

namespace App\Core\Cemetery\Dto\Sections;

final readonly class UpdateCemeterySectionDto
{
    public function __construct(
        public string $municipalId,
        public string $cemeterySiteId,
        public string $sectionId,
        public string $name,
        public ?string $description,
    ) {}

    public static function fromRequest(array $data, string $cemeterySiteId, string $sectionId): self
    {
        return new self(
            municipalId: app('municipal_id'),
            cemeterySiteId: $cemeterySiteId,
            sectionId: $sectionId,
            name: mb_strtoupper(trim($data['name'])),
            description: self::clean($data['description'] ?? null),
        );
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
