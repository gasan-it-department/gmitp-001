<?php

namespace App\External\Api\Request\Auth;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'user_identifier' => 'required|string|min:3|max:255',
            'password' => 'required|string|min:8|max:100',
            'remember_me' => ['boolean']
        ];
    }

    public function messages(): array
    {
        return [
            'user_identifier.required' => 'Please enter your phone number or email address.',
            'user_identifier.string' => 'The identifier must be a valid string.',
            'user_identifier.min' => 'The identifier must be at least :min characters.',
            'user_identifier.max' => 'The identifier may not be greater than :max characters.',

            'password.required' => 'Please enter your password.',
            'password.string' => 'The password must be a valid string.',
            'password.min' => 'The password must be at least :min characters long.',
            'password.max' => 'The password may not be longer than :max characters.',

            'remember_me.boolean' => 'The remember me field must be true or false.',
        ];
    }
}
