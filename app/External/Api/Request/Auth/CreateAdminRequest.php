<?php

namespace App\External\Api\Request\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CreateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Security: Only Super Admins should be creating other Admins
        // You can add: return $this->user()->hasRole('super_admin');
        return true;
    }

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
                'unique:users,user_name',
                'regex:/^[a-z0-9\._]+$/'
            ],

            'email' => [
                'required',
                'email:rfc,dns',
                'unique:users,email'
            ],

            'phone' => ['required', 'min:11', 'max:11', 'unique:users,phone', 'regex:/^(09\d{9}|\+639\d{9}|9\d{9})$/'],

            'municipal_id' => ['required', 'ulid', 'exists:municipalities,id'],

            'password' => ['required', 'confirmed', Password::defaults()],

            'permission' => ['required', 'array'],
            'permission.*' => ['string', 'exists:permissions,name'],
        ];
    }

    public function messages(): array
    {
        return [
            'municipal_id.required' => 'You must assign a municipality to this administrator.',
            'permission.*.exists' => 'One of the selected permissions is invalid.',
            'email.required' => 'Administrative accounts require an official email address.',
        ];
    }
}