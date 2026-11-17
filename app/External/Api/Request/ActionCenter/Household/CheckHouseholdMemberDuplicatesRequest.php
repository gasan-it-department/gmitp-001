<?php

namespace App\External\Api\Request\ActionCenter\Household;

use Illuminate\Foundation\Http\FormRequest;

class CheckHouseholdMemberDuplicatesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('action_center.beneficiaries.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'], 'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'], 'suffix' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:today'],
        ];
    }
}
