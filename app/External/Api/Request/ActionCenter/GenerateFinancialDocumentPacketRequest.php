<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateFinancialDocumentPacketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'intake_date',
            'obligation_request_number',
            'responsibility_center',
            'account_code',
            'office',
            'fpp',
            'particulars',
            'disbursement_voucher_number',
            'mode_of_payment',
            'tin_employee_number',
            'explanation',
            'mswdo_printed_name',
            'mswdo_position',
            'budget_officer_printed_name',
            'budget_officer_position',
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
            'intake_date' => ['required', 'date_format:Y-m-d'],
            'obligation_request_number' => ['required', 'string', 'max:60'],
            'responsibility_center' => ['required', 'string', 'max:80'],
            'account_code' => ['required', 'string', 'max:80'],
            'office' => ['nullable', 'string', 'max:150'],
            'fpp' => ['nullable', 'string', 'max:80'],
            'particulars' => ['required', 'string', 'max:1000'],
            'disbursement_voucher_number' => ['nullable', 'string', 'max:60'],
            'mode_of_payment' => ['required', 'string', Rule::in(['check', 'cash', 'others'])],
            'tin_employee_number' => ['nullable', 'string', 'max:50'],
            'explanation' => ['required', 'string', 'max:1000'],
            'mswdo_printed_name' => ['required', 'string', 'max:150'],
            'mswdo_position' => ['required', 'string', 'max:150'],
            'budget_officer_printed_name' => ['required', 'string', 'max:150'],
            'budget_officer_position' => ['required', 'string', 'max:150'],
            'accountant_printed_name' => ['required', 'string', 'max:150'],
            'accountant_position' => ['required', 'string', 'max:150'],
            'treasurer_printed_name' => ['required', 'string', 'max:150'],
            'treasurer_position' => ['required', 'string', 'max:150'],
            'mayor_printed_name' => ['required', 'string', 'max:150'],
            'mayor_position' => ['required', 'string', 'max:150'],
        ];
    }
}
