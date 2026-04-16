<?php

namespace App\External\Api\Request\Procurement;

use App\Core\Procurement\Enums\ProcurementCategory;
use App\Core\Procurement\Enums\ProcurementStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GetProcurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {

        $allowedSortFields = [
            'reference_number',
            'title',
            'category',
            'status',
            'abc_amount',
            'closing_date',
            'created_at',
        ];
        return [
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::enum(ProcurementStatus::class)],
            'category' => ['nullable', 'string', Rule::enum(ProcurementCategory::class)],
            'sort_field' => [
                'nullable',
                'string',
                Rule::in($allowedSortFields),
            ],
            'sort_direction' => [
                'nullable',
                'string',
                Rule::in(['asc', 'desc']),
            ],

            'department' => ['nullable', 'string'],
            'funding' => ['nullable', 'string'],
        ];
    }

}