<?php

namespace App\Core\ActionCenter\Dto\Report;

class BeneficiaryRegistryReportFiltersDto
{
    public const LIFECYCLE_CURRENT = 'current';

    public const LIFECYCLE_INACTIVE = 'inactive';

    public const LIFECYCLE_MERGED = 'merged';

    public const LIFECYCLE_ALL = 'all';

    public const SOURCE_PORTAL = 'portal';

    public const SOURCE_WALK_IN = 'walk_in';

    public function __construct(
        public readonly ?string $search = null,
        public readonly ?string $barangay = null,
        public readonly ?string $sex = null,
        public readonly ?string $verification = null,
        public readonly ?string $source = null,
        public readonly string $lifecycle = self::LIFECYCLE_CURRENT,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            search: self::nullableString($filters['search'] ?? null),
            barangay: self::nullableString($filters['barangay'] ?? null),
            sex: self::nullableString($filters['sex'] ?? null),
            verification: self::nullableString($filters['verification'] ?? null),
            source: self::nullableString($filters['source'] ?? null),
            lifecycle: self::nullableString($filters['lifecycle'] ?? null) ?: self::LIFECYCLE_CURRENT,
            perPage: max(10, min((int) ($filters['per_page'] ?? 15), 100)),
        );
    }

    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'barangay' => $this->barangay,
            'sex' => $this->sex,
            'verification' => $this->verification,
            'source' => $this->source,
            'lifecycle' => $this->lifecycle,
            'per_page' => $this->perPage,
        ];
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
