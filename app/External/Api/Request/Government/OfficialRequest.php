<?php

namespace App\External\Api\Request\Government;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class OfficialRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'], // e.g., Jr., III
            'biography' => ['nullable', 'string'],
            'gender' => ['nullable', 'string', Rule::in(['Male', 'Female', 'male', 'female'])],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png', 'max:2048'],
        ];
    }


    public function messages(): array
    {
        return [
            'first_name.required' => 'The official\'s first name is mandatory.',
            'gender.in' => 'Please select a valid gender option.',
        ];
    }
}
