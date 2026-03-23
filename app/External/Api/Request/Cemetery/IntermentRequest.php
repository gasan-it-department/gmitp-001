<?php

namespace App\External\Api\Request\Cemetery;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IntermentRequest extends FormRequest
{

    public function authorize(): bool
    {
        return true;
    }



    public function rules(): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],

            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:20'], // e.g. "Jr.", "III"

            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:date_of_birth'],

            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female', 'male', 'female'])],
            'cause_of_death' => ['nullable', 'string', 'max:255'],

            'death_certificate_number' => ['nullable', 'string', 'max:50'],

            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }


    public function messages(): array
    {
        return [
            'date_of_death.after_or_equal' => 'Date of death cannot be before date of birth.',
        ];
    }
}