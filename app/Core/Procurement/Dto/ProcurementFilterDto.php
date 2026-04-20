<?php

namespace App\Core\Procurement\Dto;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;

readonly class ProcurementFilterDto
{
    public function __construct(
        public ?string $search,
        public ?ProcurementStatus $status,
        public ?ProcurementCategory $category,
        public ?string $departmentId,
        public ?string $fundingSourceId,
        public ?string $sortField,
        public ?string $sortDirection,
    ) {
    }

    public static function fromRequest(array $validated): self
    {
        $sortField = in_array($validated['sort_field'] ?? '', ['abc_amount', 'closing_date', 'title']) ? $validated['sort_field'] : 'created_at';
        return new self(
            search: !empty($validated['search']) ? strtoupper($validated['search']) : null,
            status: isset($validated['status']) ? ProcurementStatus::tryFrom($validated['status']) : null,
            category: isset($validated['category']) ? ProcurementCategory::tryFrom($validated['category']) : null,
            departmentId: isset($validated['department']) ? (string) $validated['department'] : null,
            fundingSourceId: isset($validated['funding']) ? (string) $validated['funding'] : null,
            sortField: $sortField,
            sortDirection: ($validated['sort_direction'] ?? 'desc') === 'asc' ? 'asc' : 'asc',
        );

    }
}