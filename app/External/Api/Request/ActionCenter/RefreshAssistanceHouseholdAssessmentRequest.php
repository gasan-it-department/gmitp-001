<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class RefreshAssistanceHouseholdAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('correction_reason'))) {
            $this->merge(['correction_reason' => trim($this->input('correction_reason'))]);
        }
    }

    public function rules(): array
    {
        return [
            'assessment_fingerprint' => ['required', 'string', 'size:64'],
            // Under-review sync omits this field. Approved requests require it
            // in the locked Core action, where the status is authoritative.
            'correction_reason' => ['nullable', 'string', 'min:10', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'assessment_fingerprint.required' => 'Refresh the household comparison before synchronizing.',
            'correction_reason.min' => 'The correction reason must be at least 10 characters.',
            'correction_reason.max' => 'The correction reason may not exceed 1,000 characters.',
        ];
    }
}
