<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ApplyAssistanceRequestProfileCorrectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('reason'))) {
            $this->merge(['reason' => trim($this->input('reason'))]);
        }
    }

    public function rules(): array
    {
        return [
            'fields' => ['required', 'array', 'min:1'],
            'fields.*' => ['required', 'string', 'distinct', Rule::in([
                'first_name',
                'middle_name',
                'last_name',
                'suffix',
                'sex',
                'birth_date',
                'educational_attainment',
                'religion',
                'civil_status',
                'occupation',
                'monthly_income',
            ])],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'fields.required' => 'Select at least one profile correction to apply.',
            'fields.min' => 'Select at least one profile correction to apply.',
            'fields.*.in' => 'One of the selected profile corrections is not supported.',
            'reason.required' => 'Enter the reason for correcting the frozen claimant snapshot.',
            'reason.min' => 'The correction reason must be at least 10 characters.',
        ];
    }
}
