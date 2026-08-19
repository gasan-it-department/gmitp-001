<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class GenerateCertificateOfEligibilityRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fields = [
            'intake_date',
            'certified_by_name',
            'certified_by_position',
            'approved_by_name',
            'approved_by_position',
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
            'intake_date' => ['required', 'date_format:Y-m-d'],
            'certified_by_name' => ['required', 'string', 'max:150'],
            'certified_by_position' => ['required', 'string', 'max:150'],
            'approved_by_name' => ['required', 'string', 'max:150'],
            'approved_by_position' => ['required', 'string', 'max:150'],
        ];
    }
}
