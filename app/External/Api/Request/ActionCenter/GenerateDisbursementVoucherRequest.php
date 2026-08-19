<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateDisbursementVoucherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'disbursement_voucher_number',
            'mode_of_payment',
            'tin_employee_number',
            'obligation_request_number',
            'responsibility_center_office',
            'responsibility_center_code',
            'explanation',
            'accountant_printed_name',
            'accountant_position',
            'treasurer_printed_name',
            'treasurer_position',
            'mayor_printed_name',
            'mayor_position',
        ];

        $normalized = [];

        foreach ($fields as $field) {
            $value = $this->input($field);
            $normalized[$field] = is_string($value) ? trim($value) : $value;
        }

        $this->merge($normalized);
    }

    /** @return array<string, list<\Illuminate\Contracts\Validation\ValidationRule|string>> */
    public function rules(): array
    {
        return [
            'disbursement_voucher_number' => ['nullable', 'string', 'max:60'],
            'mode_of_payment' => ['required', 'string', Rule::in(['check', 'cash', 'others'])],
            'tin_employee_number' => ['nullable', 'string', 'max:50'],
            'obligation_request_number' => ['required', 'string', 'max:60'],
            'responsibility_center_office' => ['nullable', 'string', 'max:150'],
            'responsibility_center_code' => ['required', 'string', 'max:80'],
            'explanation' => ['required', 'string', 'max:1000'],
            'accountant_printed_name' => ['required', 'string', 'max:150'],
            'accountant_position' => ['required', 'string', 'max:150'],
            'treasurer_printed_name' => ['required', 'string', 'max:150'],
            'treasurer_position' => ['required', 'string', 'max:150'],
            'mayor_printed_name' => ['required', 'string', 'max:150'],
            'mayor_position' => ['required', 'string', 'max:150'],
        ];
    }
}
