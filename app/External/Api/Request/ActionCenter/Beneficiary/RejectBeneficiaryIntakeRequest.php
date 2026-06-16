<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;

class RejectBeneficiaryIntakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Enter the reason this beneficiary intake is being rejected.',
            'reason.min' => 'Please provide a clearer reason for rejecting this intake.',
            'reason.max' => 'The rejection reason must be 1000 characters or fewer.',
        ];
    }
}
