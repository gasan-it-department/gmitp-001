<?php

namespace App\Core\Department\Dto;

readonly class DepartmentFiltersDto
{
    public const STATUS_ACTIVE = 'active';

    public const STATUS_INACTIVE = 'inactive';

    public const SORT_NAME_ASC = 'name_asc';

    public const SORT_NAME_DESC = 'name_desc';

    public const SORT_CREATED_DESC = 'created_desc';

    public const PER_PAGE = 20;

    public function __construct(
        public ?string $search,
        public ?string $status,
        public string $sort = self::SORT_NAME_ASC,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            status: self::allowedString($filters['status'] ?? null, [
                self::STATUS_ACTIVE,
                self::STATUS_INACTIVE,
            ]),
            sort: self::allowedString($filters['sort'] ?? null, [
                self::SORT_NAME_ASC,
                self::SORT_NAME_DESC,
                self::SORT_CREATED_DESC,
            ]) ?? self::SORT_NAME_ASC,
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'status' => $this->status,
            'sort' => $this->sort,
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

    private static function allowedString(mixed $value, array $allowed): ?string
    {
        $value = self::nullableString($value);

        return $value !== null && in_array($value, $allowed, true) ? $value : null;
    }
}
