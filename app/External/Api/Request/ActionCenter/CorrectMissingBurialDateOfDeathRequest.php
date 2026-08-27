<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shape validation for the one-time approved burial Date of Death repair.
 * Program, status, tenant, and one-time rules belong to the Core action.
 */
class CorrectMissingBurialDateOfDeathRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_death' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'date_of_death.required' => 'Enter the deceased person\'s Date of Death.',
            'date_of_death.date_format' => 'Date of Death must be a valid date.',
            'date_of_death.before_or_equal' => 'Date of Death cannot be in the future.',
            'reason.required' => 'Enter the administrative correction reason.',
            'reason.min' => 'The correction reason must be at least 10 characters.',
        ];
    }
}
