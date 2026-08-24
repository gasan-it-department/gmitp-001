<?php

namespace App\External\Api\Request\Department;

use App\Core\Department\Dto\DepartmentFiltersDto;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', Rule::in([
                DepartmentFiltersDto::STATUS_ACTIVE,
                DepartmentFiltersDto::STATUS_INACTIVE,
            ])],
            'sort' => ['nullable', 'string', Rule::in([
                DepartmentFiltersDto::SORT_NAME_ASC,
                DepartmentFiltersDto::SORT_NAME_DESC,
                DepartmentFiltersDto::SORT_CREATED_DESC,
            ])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'status',
            'sort',
        ]);
    }
}
