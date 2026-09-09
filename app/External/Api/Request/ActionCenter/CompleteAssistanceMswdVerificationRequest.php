<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class CompleteAssistanceMswdVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expected_fingerprint' => ['required', 'string', 'size:64'],
            'identity_confirmed' => ['accepted'],
            'household_confirmed' => ['accepted'],
            'eligibility_confirmed' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'identity_confirmed.accepted' => 'Confirm identity verification before completing MSWD review.',
            'household_confirmed.accepted' => 'Confirm the assessed household before completing MSWD review.',
            'eligibility_confirmed.accepted' => 'Confirm eligibility before completing MSWD review.',
        ];
    }
}
