<?php

namespace App\External\Api\Request\Cemetery\Reports;

use App\Core\Cemetery\Dto\Reports\LeaseReportFiltersDto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LeaseReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_id' => ['nullable', 'ulid'],
            'section_id' => ['nullable', 'ulid'],
            'block_id' => ['nullable', 'ulid'],
            'lease_state' => ['nullable', Rule::in([
                LeaseReportFiltersDto::STATE_EXPIRED,
                LeaseReportFiltersDto::STATE_EXPIRING_SOON,
                LeaseReportFiltersDto::STATE_ACTIVE,
                LeaseReportFiltersDto::STATE_NO_ACTIVE_LEASE,
                LeaseReportFiltersDto::STATE_ALL,
            ])],
            'lease_end_from' => ['nullable', 'date'],
            'lease_end_to' => ['nullable', 'date', 'after_or_equal:lease_end_from'],
            'expiring_within_days' => ['nullable', 'integer', 'between:1,365'],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'site_id',
            'section_id',
            'block_id',
            'lease_state',
            'lease_end_from',
            'lease_end_to',
            'expiring_within_days',
            'per_page',
        ]);
    }
}
