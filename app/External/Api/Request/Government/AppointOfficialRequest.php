<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class AppointOfficialRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // --- Context Fields (Always Required) ---
            'term_id' => ['required', 'string', 'exists:terms,id'],
            'position_id' => ['required', 'string', 'exists:positions,id'],
            'actual_start_date' => ['required', 'date'],
            'political_party' => ['nullable', 'string', 'max:100'],
            'photo' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // --- The "Logic Switch" ---
            // If official_id is present, we use an existing person.
            // If it is NOT present, the name fields become mandatory.
            'official_id' => ['nullable', 'string', 'exists:officials,id'],

            'first_name' => [
                'required_without:official_id',
                'nullable',
                'string',
                'max:100'
            ],
            'last_name' => [
                'required_without:official_id',
                'nullable',
                'string',
                'max:100'
            ],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:10'],
            'gender' => [
                'required_without:official_id',
                'nullable',
                'string',
                Rule::in(['male', 'female', 'other'])
            ],
        ];
    }

    /**
     * Custom error messages to make the UI friendly
     */
    public function messages(): array
    {
        return [
            'first_name.required_without' => 'Please provide a first name or select an existing official.',
            'last_name.required_without' => 'Please provide a last name if this is a new official.',
            'gender.required_without' => 'Gender is required for new officials.',
            'term_id.exists' => 'The selected term is invalid.',
            'position_id.exists' => 'The selected position is invalid.',
        ];
    }
}
