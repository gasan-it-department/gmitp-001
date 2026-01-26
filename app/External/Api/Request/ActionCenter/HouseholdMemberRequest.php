<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class HouseholdMemberRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // <--- CHANGED FROM FALSE TO TRUE
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Using regex to allow names with spaces, dashes, dots (e.g. "Ma. Teresa")
            'first_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'last_name' => ['required', 'string', 'max:255', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            // Min:2 forces them to type "Santos" instead of just "S"
            'middle_name' => ['nullable', 'string', 'max:255', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'suffix' => ['nullable', 'string', 'max:10', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'birth_date' => ['required', 'date', 'before:today'],
            'relationship' => ['required', 'string'],

            // Address Fields
            'province' => ['required', 'string', 'max:50'],
            'municipality' => ['required', 'string', 'max:50'],
            'barangay' => ['required', 'string', 'max:50'],

            // Added rules here (nullable is important!)
            'street_address' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Custom error messages for specific rules.
     */
    public function messages(): array
    {
        return [
            // This targets the 'min' rule on the 'middle_name' field specifically
            'middle_name.min' => 'Please enter the full middle name (not just the initial).',

            'birth_date.before' => 'The birth date must be in the past.',
            'first_name.regex' => 'First name contains invalid characters.',
        ];
    }
}