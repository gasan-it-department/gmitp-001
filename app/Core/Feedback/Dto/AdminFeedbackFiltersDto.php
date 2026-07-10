<?php

namespace App\Core\Feedback\Dto;

readonly class AdminFeedbackFiltersDto
{
    public const VISIBILITY_ANONYMOUS = 'anonymous';

    public const VISIBILITY_IDENTIFIED = 'identified';

    public const TARGET_EMPLOYEE = 'employee';

    public const TARGET_DEPARTMENT = 'department';

    public const TARGET_UNASSIGNED = 'unassigned';

    public const HAS_ATTACHMENTS_YES = 'yes';

    public const HAS_ATTACHMENTS_NO = 'no';

    public const SORT_NEWEST = 'newest';

    public const SORT_OLDEST = 'oldest';

    public const SORT_RATING_HIGH = 'rating_high';

    public const SORT_RATING_LOW = 'rating_low';

    public const DEFAULT_PER_PAGE = 20;

    public const PER_PAGE_OPTIONS = [10, 20, 50, 100];

    public function __construct(
        public ?string $search,
        public ?string $departmentId,
        public ?string $subject,
        public ?int $rating,
        public ?string $visibility,
        public ?string $target,
        public ?string $hasAttachments,
        public ?string $dateFrom,
        public ?string $dateTo,
        public string $sort = self::SORT_NEWEST,
        public int $perPage = self::DEFAULT_PER_PAGE,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            departmentId: self::nullableString($filters['department_id'] ?? null),
            subject: self::nullableString($filters['subject'] ?? null),
            rating: self::nullableInteger($filters['rating'] ?? null),
            visibility: self::allowedString($filters['visibility'] ?? null, [
                self::VISIBILITY_ANONYMOUS,
                self::VISIBILITY_IDENTIFIED,
            ]),
            target: self::allowedString($filters['target'] ?? null, [
                self::TARGET_EMPLOYEE,
                self::TARGET_DEPARTMENT,
                self::TARGET_UNASSIGNED,
            ]),
            hasAttachments: self::allowedString($filters['has_attachments'] ?? null, [
                self::HAS_ATTACHMENTS_YES,
                self::HAS_ATTACHMENTS_NO,
            ]),
            dateFrom: self::nullableString($filters['date_from'] ?? null),
            dateTo: self::nullableString($filters['date_to'] ?? null),
            sort: self::allowedString($filters['sort'] ?? null, [
                self::SORT_NEWEST,
                self::SORT_OLDEST,
                self::SORT_RATING_HIGH,
                self::SORT_RATING_LOW,
            ]) ?? self::SORT_NEWEST,
            perPage: self::allowedInteger($filters['per_page'] ?? null, self::PER_PAGE_OPTIONS) ?? self::DEFAULT_PER_PAGE,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'department_id' => $this->departmentId,
            'subject' => $this->subject,
            'rating' => $this->rating,
            'visibility' => $this->visibility,
            'target' => $this->target,
            'has_attachments' => $this->hasAttachments,
            'date_from' => $this->dateFrom,
            'date_to' => $this->dateTo,
            'sort' => $this->sort,
            'per_page' => $this->perPage,
        ];
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value) && ! is_numeric($value)) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private static function nullableInteger(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        return (int) $value;
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
