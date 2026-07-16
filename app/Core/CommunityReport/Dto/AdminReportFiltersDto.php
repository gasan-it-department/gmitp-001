<?php

namespace App\Core\CommunityReport\Dto;

use App\Core\CommunityReport\Enums\ReportCategory;
use App\Core\CommunityReport\Enums\ReportStatus;

readonly class AdminReportFiltersDto
{
    public const VISIBILITY_ANONYMOUS = 'anonymous';

    public const VISIBILITY_IDENTIFIED = 'identified';

    public const SORT_NEWEST = 'newest';

    public const SORT_OLDEST = 'oldest';

    public const ARCHIVE_ACTIVE = 'active';

    public const ARCHIVE_ARCHIVED = 'archived';

    public const ARCHIVE_ALL = 'all';

    public const DEFAULT_PER_PAGE = 20;

    public const PER_PAGE_OPTIONS = [10, 20, 50, 100];

    public function __construct(
        public ?string $search,
        public ?ReportStatus $status,
        public ?ReportCategory $category,
        public ?string $visibility,
        public ?string $dateFrom,
        public ?string $dateTo,
        public string $sort = self::SORT_NEWEST,
        public string $archiveStatus = self::ARCHIVE_ACTIVE,
        public int $perPage = self::DEFAULT_PER_PAGE,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            status: self::enumFromValue(ReportStatus::class, $filters['status'] ?? null),
            category: self::enumFromValue(ReportCategory::class, $filters['category'] ?? null),
            visibility: self::allowedString($filters['visibility'] ?? null, [
                self::VISIBILITY_ANONYMOUS,
                self::VISIBILITY_IDENTIFIED,
            ]),
            dateFrom: self::nullableString($filters['date_from'] ?? null),
            dateTo: self::nullableString($filters['date_to'] ?? null),
            sort: self::allowedString($filters['sort'] ?? null, [
                self::SORT_NEWEST,
                self::SORT_OLDEST,
            ]) ?? self::SORT_NEWEST,
            archiveStatus: self::allowedString($filters['archive_status'] ?? null, [
                self::ARCHIVE_ACTIVE,
                self::ARCHIVE_ARCHIVED,
                self::ARCHIVE_ALL,
            ]) ?? self::ARCHIVE_ACTIVE,
            perPage: self::allowedInteger($filters['per_page'] ?? null, self::PER_PAGE_OPTIONS) ?? self::DEFAULT_PER_PAGE,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'status' => $this->status?->value,
            'category' => $this->category?->value,
            'visibility' => $this->visibility,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
            'sort' => $this->sort,
            'archive_status' => $this->archiveStatus,
            'per_page' => $this->perPage,
        ];
    }

    /**
     * @template TEnum of \BackedEnum
     *
     * @param  class-string<TEnum>  $enum
     * @return TEnum|null
     */
    private static function enumFromValue(string $enum, mixed $value): ?\BackedEnum
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return $enum::tryFrom(trim($value));
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

        if ($value === null) {
            return null;
        }

        return in_array($value, $allowed, true) ? $value : null;
    }

    private static function allowedInteger(mixed $value, array $allowed): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $value = (int) $value;

        return in_array($value, $allowed, true) ? $value : null;
    }
}
