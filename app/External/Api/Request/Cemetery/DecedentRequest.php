<?php

namespace App\External\Api\Request\Cemetery;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DecedentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Changed to true. If you have role-based permissions later, 
        // you would check them here (e.g., return $this->user()->can('create_decedents');)
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Fetch the ID if we are updating an existing record, to ignore it in the unique check
        $decedentId = $this->route('decedent');

        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:15'],

            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => [
                'nullable',
                'date',
                'before_or_equal:today',
                'after_or_equal:date_of_birth'
            ],

            'gender' => ['nullable', 'string', 'in:MALE,FEMALE'],
            'cause_of_death' => ['nullable', 'string', 'max:255'],

            'death_certificate_no' => [
                'nullable',
                'string',
                'max:255',
                // If you are using the cem_gov_ prefix instead of cemetery_, update the table name here
                Rule::unique('cemetery_decedents', 'death_certificate_no')->ignore($decedentId)
            ],

            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'The first name is required for legal records.',
            'last_name.required' => 'The last name is required for legal records.',

            'date_of_birth.before_or_equal' => 'The date of birth cannot be a future date.',

            'date_of_death.before_or_equal' => 'The date of death cannot be a future date.',
            'date_of_death.after_or_equal' => 'The date of death cannot be before the date of birth.',

            'gender.in' => 'Please select a valid gender from the list.',

            'death_certificate_no.unique' => 'This Death Certificate Number is already registered in the system.',
        ];
    }
}