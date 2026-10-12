<?php

namespace App\External\Api\Request\ActionCenter\Household;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHouseholdAddressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('action_center.beneficiaries.correct') ?? false;
    }

    public function rules(): array
    {
        return [
            'barangay_code' => ['required', 'string', 'max:20'],
            'street' => ['nullable', 'string', 'max:255'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
            'expected_fingerprint' => ['required', 'string', 'regex:/\A[a-f0-9]{64}\z/'],
        ];
    }
}
