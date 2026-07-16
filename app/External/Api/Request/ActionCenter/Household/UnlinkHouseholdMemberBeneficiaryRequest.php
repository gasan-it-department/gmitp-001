<?php

namespace App\External\Api\Request\ActionCenter\Household;

use Illuminate\Foundation\Http\FormRequest;

class UnlinkHouseholdMemberBeneficiaryRequest extends FormRequest
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
            'reason.required' => 'Explain why this beneficiary link is incorrect.',
            'reason.min' => 'Provide a more specific reason for unlinking this beneficiary.',
        ];
    }
}
