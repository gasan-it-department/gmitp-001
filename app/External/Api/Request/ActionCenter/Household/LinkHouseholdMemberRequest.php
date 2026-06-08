<?php

namespace App\External\Api\Request\ActionCenter\Household;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload for reconciling a household member to an existing beneficiary by their
 * human-friendly beneficiary number (e.g. GAS-000123). Resolution + all guards
 * live in LinkHouseholdMemberToBeneficiaryAction. The coarse admin gate is the
 * route middleware group.
 */
class LinkHouseholdMemberRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'beneficiary_number' => ['required', 'string', 'max:40'],
        ];
    }

    public function messages(): array
    {
        return [
            'beneficiary_number.required' => 'Enter the beneficiary number to link to (e.g. GAS-000123).',
        ];
    }
}
