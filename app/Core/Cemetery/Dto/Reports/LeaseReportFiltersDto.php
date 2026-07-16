<?php

namespace App\Core\Cemetery\Dto\Reports;

class LeaseReportFiltersDto
{
    public const STATE_EXPIRED = 'expired';

    public const STATE_EXPIRING_SOON = 'expiring_soon';

    public const STATE_ACTIVE = 'active';

    public const STATE_NO_ACTIVE_LEASE = 'no_active_lease';

    public const STATE_ALL = 'all';

    public function __construct(
        public readonly ?string $siteId,
        public readonly ?string $sectionId,
        public readonly ?string $blockId,
        public readonly string $leaseState = self::STATE_ALL,
        public readonly ?string $leaseEndFrom = null,
        public readonly ?string $leaseEndTo = null,
        public readonly int $expiringWithinDays = 90,
        public readonly int $perPage = 15,
    ) {}

    public static function fromArray(array $filters): self
    {
        return new self(
            siteId: self::nullableString($filters['site_id'] ?? null),
            sectionId: self::nullableString($filters['section_id'] ?? null),
            blockId: self::nullableString($filters['block_id'] ?? null),
            leaseState: self::nullableString($filters['lease_state'] ?? null) ?: self::STATE_ALL,
            leaseEndFrom: self::nullableString($filters['lease_end_from'] ?? null),
            leaseEndTo: self::nullableString($filters['lease_end_to'] ?? null),
            expiringWithinDays: filled($filters['expiring_within_days'] ?? null) ? (int) $filters['expiring_within_days'] : 90,
            perPage: filled($filters['per_page'] ?? null) ? (int) $filters['per_page'] : 15,
        );
    }

    public function toArray(): array
    {
        return [
            'site_id' => $this->siteId,
            'section_id' => $this->sectionId,
            'block_id' => $this->blockId,
            'lease_state' => $this->leaseState,
            'lease_end_from' => $this->leaseEndFrom,
            'lease_end_to' => $this->leaseEndTo,
            'expiring_within_days' => $this->expiringWithinDays,
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
