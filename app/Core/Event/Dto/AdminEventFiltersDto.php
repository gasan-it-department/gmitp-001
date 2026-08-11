<?php

namespace App\Core\Event\Dto;

use App\Core\Event\Enums\EventType;

readonly class AdminEventFiltersDto
{
    public const SCHEDULE_ONGOING = 'ongoing';

    public const SCHEDULE_UPCOMING = 'upcoming';

    public const SCHEDULE_PAST = 'past';

    public const PUBLICATION_PUBLISHED = 'published';

    public const PUBLICATION_DRAFT = 'draft';

    public const SORT_RELEVANCE = 'relevance';

    public const SORT_START_ASC = 'start_asc';

    public const SORT_START_DESC = 'start_desc';

    public const SORT_UPDATED_DESC = 'updated_desc';

    public const PER_PAGE = 20;

    public function __construct(
        public ?string $search,
        public ?string $schedule,
        public ?string $publication,
        public ?EventType $type,
        public ?string $dateFrom,
        public ?string $dateTo,
        public string $sort = self::SORT_RELEVANCE,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            schedule: self::allowedString($filters['schedule'] ?? null, [
                self::SCHEDULE_ONGOING,
                self::SCHEDULE_UPCOMING,
                self::SCHEDULE_PAST,
            ]),
            publication: self::allowedString($filters['publication'] ?? null, [
                self::PUBLICATION_PUBLISHED,
                self::PUBLICATION_DRAFT,
            ]),
            type: self::eventType($filters['type'] ?? null),
            dateFrom: self::nullableString($filters['date_from'] ?? null),
            dateTo: self::nullableString($filters['date_to'] ?? null),
            sort: self::allowedString($filters['sort'] ?? null, [
                self::SORT_RELEVANCE,
                self::SORT_START_ASC,
                self::SORT_START_DESC,
                self::SORT_UPDATED_DESC,
            ]) ?? self::SORT_RELEVANCE,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'schedule' => $this->schedule,
            'publication' => $this->publication,
            'type' => $this->type?->value,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
            'sort' => $this->sort,
        ];
    }

    private static function eventType(mixed $value): ?EventType
    {
        $value = self::nullableString($value);

        return $value === null ? null : EventType::tryFrom($value);
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
