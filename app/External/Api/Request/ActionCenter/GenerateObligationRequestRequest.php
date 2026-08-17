<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class GenerateObligationRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'obligation_request_number',
            'responsibility_center',
            'account_code',
            'particulars',
            'mswdo_printed_name',
            'mswdo_position',
            'budget_officer_printed_name',
            'budget_officer_position',
            'office',
            'fpp',
        ];

        $normalized = [];

        foreach ($fields as $field) {
            $value = $this->input($field);
            $normalized[$field] = is_string($value) ? trim($value) : $value;
        }

        $this->merge($normalized);
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return [
            'obligation_request_number' => ['required', 'string', 'max:60'],
            'responsibility_center' => ['required', 'string', 'max:80'],
            'account_code' => ['required', 'string', 'max:80'],
            'office' => ['nullable', 'string', 'max:150'],
            'fpp' => ['nullable', 'string', 'max:80'],
            'particulars' => ['required', 'string', 'max:1000'],
            'mswdo_printed_name' => ['required', 'string', 'max:150'],
            'mswdo_position' => ['required', 'string', 'max:150'],
            'budget_officer_printed_name' => ['required', 'string', 'max:150'],
            'budget_officer_position' => ['required', 'string', 'max:150'],
        ];
    }
}
