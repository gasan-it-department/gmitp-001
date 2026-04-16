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
        return [
            'search' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', Rule::enum(ProcurementStatus::class)],
            'category' => ['nullable', 'string', Rule::enum(ProcurementCategory::class)],

            'department' => ['nullable', 'string'],
            'funding' => ['nullable', 'string'],
        ];
    }

}