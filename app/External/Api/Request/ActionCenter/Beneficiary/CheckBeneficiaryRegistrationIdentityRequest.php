<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;

final class CheckBeneficiaryRegistrationIdentityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['required', 'date', 'before:today'],
            'selected_member_id' => ['nullable', 'ulid'],
            'household_id' => ['nullable', 'ulid', 'required_with:selected_member_id'],
        ];
    }
}
