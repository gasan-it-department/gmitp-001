<?php

namespace App\External\Api\Request\Government;

use Illuminate\Foundation\Http\FormRequest;

class TermRequest extends FormRequest
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
            'name' => [
                'required',
                'string',
                'max:100',
                'unique:terms,name' // Prevents creating "2022-2025" twice
            ],

            'statutory_start' => [
                'required',
                'date'
            ],
            'statutory_end' => [
                'required',
                'date',
                'after:statutory_start' // Validation: End MUST be after start
            ],

            'is_current' => [
                'boolean'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'statutory_end.after' => 'The term end date must be after the start date.',
            'name.unique' => 'A term with this name already exists.',
        ];
    }
}
