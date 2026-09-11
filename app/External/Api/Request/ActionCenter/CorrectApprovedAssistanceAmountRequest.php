<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class CorrectApprovedAssistanceAmountRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('reason'))) {
            $this->merge(['reason' => trim($this->input('reason'))]);
        }
    }

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_approved' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:99999999.99'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'confirm' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_approved.required' => 'Enter the corrected approved amount.',
            'amount_approved.decimal' => 'The corrected amount may have no more than two decimal places.',
            'amount_approved.gt' => 'The corrected amount must be greater than zero.',
            'reason.required' => 'Enter the administrative correction reason.',
            'reason.min' => 'The correction reason must be at least 10 characters.',
            'confirm.accepted' => 'Confirm that the corrected amount matches the authorized source document.',
        ];
    }
}
