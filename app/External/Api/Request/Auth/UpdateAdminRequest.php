<?php

namespace App\External\Api\Request\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UpdateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        // super_admin passes via Gate::before. Mirrors CreateAdminRequest;
        // designed for delegation via the (reserved) `users.update` permission.
        return (bool) $this->user()?->can('users.update');
    }

    public function rules(): array
    {
        // Ignore the admin being edited in the unique checks.
        $adminId = $this->route('id');

        return [
            'first_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'middle_name' => ['nullable', 'max:100', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'last_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'email' => [
                'required',
                'email:rfc,dns',
                'unique:users,email,' . $adminId,
            ],

            'phone' => ['required', 'min:11', 'max:11', 'unique:users,phone,' . $adminId, 'regex:/^(09\d{9}|\+639\d{9}|9\d{9})$/'],

            'municipal_id' => ['required', 'ulid', 'exists:municipalities,id'],

            // Optional on edit — only updates the password when provided.
            'password' => ['nullable', 'confirmed', Password::defaults()],

            'permission' => ['required', 'array'],
            'permission.*' => ['string'],
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
