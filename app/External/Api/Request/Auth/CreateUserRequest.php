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
            'first_name' => 'required|string|min:2|max:100',
            'middle_name' => 'nullable|string|max:100',
            'last_name' => 'required|string|max:100',
            'user_name' => 'required|string|min:3|max:100||alpha_dash|unique:users,user_name',
            'phone' => 'required|string|max:15|min:10|unique:users,phone',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|string',
        ];

    }
}
