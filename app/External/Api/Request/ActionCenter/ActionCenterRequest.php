<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class ActionCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Merge the rules here so the user sees ALL errors at once
        return [
            // Beneficiary Rules
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'middle_name' => ['nullable', 'string', 'min:2', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['required', 'date'],
            'province' => ['required', 'string'],
            'municipality' => ['required', 'string'],
            'barangay' => ['required', 'string'],

            // Assistance Rules
            'assistance_type' => ['required', 'string'],
            'description' => ['required', 'string'],
            'documents' => ['required', 'array'],
            'documents.*' => ['file', 'mimes:pdf,jpg,png', 'max:5120'],
        ];
    }

}