<?php

namespace App\Core\Announcement\Dto;

use App\Core\Announcement\Enums\AnnouncementType;

readonly class AdminAnnouncementFiltersDto
{
    public const PUBLICATION_PUBLISHED = 'published';

    public const PUBLICATION_DRAFT = 'draft';

    public const SORT_CREATED_DESC = 'created_desc';

    public const SORT_CREATED_ASC = 'created_asc';

    public const SORT_UPDATED_DESC = 'updated_desc';

    public const PER_PAGE = 20;

    public function __construct(
        public ?string $search,
        public ?string $publication,
        public ?AnnouncementType $type,
        public string $sort = self::SORT_CREATED_DESC,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            publication: self::allowedString($filters['publication'] ?? null, [
                self::PUBLICATION_PUBLISHED,
                self::PUBLICATION_DRAFT,
            ]),
            type: self::announcementType($filters['type'] ?? null),
            sort: self::allowedString($filters['sort'] ?? null, [
                self::SORT_CREATED_DESC,
                self::SORT_CREATED_ASC,
                self::SORT_UPDATED_DESC,
            ]) ?? self::SORT_CREATED_DESC,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'publication' => $this->publication,
            'type' => $this->type?->value,
            'sort' => $this->sort,
        ];
    }

    private static function announcementType(mixed $value): ?AnnouncementType
    {
        $value = self::nullableString($value);

        return $value === null ? null : AnnouncementType::tryFrom($value);
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private static function allowedString(mixed $value, array $allowed): ?string
    {
        $value = self::nullableString($value);

        return $value !== null && in_array($value, $allowed, true) ? $value : null;
    }
}
