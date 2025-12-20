<?php

namespace App\External\Api\Request\Auth;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
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

            'first_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'middle_name' => ['nullable', 'max:100', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'last_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'user_name' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'regex:/^[a-z0-9]+$/',
                'unique:users,user_name'
            ],

            'email' => [
                'nullable',
                'email:rfc,dns',
                'unique:users,email',
                'ends_with:@gmail.com,@yahoo.com,@outlook.com,@hotmail.com',
            ],

            'phone' => ['required', 'min:11', 'max:11', 'unique:users,phone', 'regex:/^(09\d{9}|\+639\d{9}|9\d{9})$/'],

            'password' => ['required', 'string', 'min:8', 'confirmed'],

            'role' => 'nullable|string',
        ];

    }

    public function messages(): array
    {
        return [
            // First name
            'first_name.required' => 'Please enter your first name.',
            'first_name.min' => 'First name must be at least :min characters.',
            'first_name.max' => 'First name cannot exceed :max characters.',
            'first_name.regex' => 'First name can only contain letters, spaces, hyphens, apostrophes, and periods.',

            // Middle name
            'middle_name.max' => 'Middle name cannot exceed :max characters.',
            'middle_name.regex' => 'Middle name can only contain letters, spaces, hyphens, apostrophes, and periods.',

            // Last name
            'last_name.required' => 'Please enter your last name.',
            'last_name.min' => 'Last name must be at least :min characters.',
            'last_name.max' => 'Last name cannot exceed :max characters.',
            'last_name.regex' => 'Last name can only contain letters, spaces, hyphens, apostrophes, and periods.',

            // Username
            'user_name.required' => 'Please choose a username.',
            'user_name.min' => 'Username must be at least :min characters.',
            'user_name.max' => 'Username cannot exceed :max characters.',
            'user_name.regex' => 'Username can only contain lowercase letters and numbers, with no spaces or special symbols.',
            'user_name.unique' => 'This username is already taken. Please choose another one.',

            // Phone
            'phone.required' => 'Please enter your phone number.',
            'phone.digits_between' => 'Phone number must be between :min and :max digits.',
            'phone.unique' => 'This phone number is already registered.',

            // Password
            'password.required' => 'Please enter a password.',
            'password.min' => 'Password must be at least :min characters.',
            'password.confirmed' => 'Password confirmation does not match.',

            // Role
            'role.string' => 'Invalid role selection.',
        ];
    }

}
