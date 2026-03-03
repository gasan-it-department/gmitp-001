<?php

namespace App\External\Api\Request\Government;

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
            'term_id' => ['required', 'string', 'exists:gov_terms,id'],
            'position_id' => ['required', 'string', 'exists:gov_positions,id'],
            'actual_start_date' => ['nullable', 'date'],
            'political_party' => ['nullable', 'string', 'max:100'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],

            // --- The "Logic Switch" ---
            // If official_id is present, we use an existing person.
            // If it is NOT present, the name fields become mandatory.
            'official_id' => ['nullable', 'string', 'exists:gov_officials,id'],

        ];
    }

    /**
     * Custom error messages to make the UI friendly
     */
    public function messages(): array
    {
        return [
            'term_id.exists' => 'The selected term is invalid.',
            'position_id.exists' => 'The selected position is invalid.',
        ];
    }
}
