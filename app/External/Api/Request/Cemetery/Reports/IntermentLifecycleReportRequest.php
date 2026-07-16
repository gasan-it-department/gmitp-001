<?php

namespace App\External\Api\Request\Cemetery\Reports;

use App\Core\Cemetery\Enums\IntermentEndType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IntermentLifecycleReportRequest extends FormRequest
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
            'lifecycle_status' => ['nullable', Rule::in(['active', 'moved', 'exhumed', 'transferred_out', 'voided', 'all'])],
            'end_type' => ['nullable', Rule::enum(IntermentEndType::class)],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
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
            'lifecycle_status',
            'end_type',
            'date_from',
            'date_to',
            'per_page',
        ]);
    }
}
