<?php

namespace App\External\Api\Request\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CreateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        // super_admin always passes (Gate::before grants them everything).
        // Designed for delegation: a municipal admin granted `users.create`
        // can create admins too. The route is still super_admin-only for now —
        // see docs/permissions.md. `can()` safely returns false for a
        // not-yet-seeded permission, so this never throws.
        return (bool) $this->user()?->can('users.create');
    }

    public function rules(): array
    {
        return [
            'first_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'middle_name' => ['nullable', 'max:100', 'regex:/^[\p{L}\s\-\'\.]+$/u'],
            'last_name' => ['required', 'max:100', 'min:2', 'regex:/^[\p{L}\s\-\'\.]+$/u'],

            'email' => [
                'nullable',
                'email:rfc,dns',
                'unique:users,email'
            ],

            'phone' => ['required', 'min:11', 'max:11', 'unique:users,phone', 'regex:/^(09\d{9}|\+639\d{9}|9\d{9})$/'],

            'municipal_id' => ['required', 'ulid', 'exists:municipalities,id'],

            'password' => ['required', 'confirmed', Password::defaults()],

            'permission' => ['required', 'array'],
            'permission.*' => ['string'],
        ];
    }

    public function messages(): array
    {
        return [
            'municipal_id.required' => 'You must assign a municipality to this administrator.',
            'permission.*.exists' => 'One of the selected permissions is invalid.',
        ];
    }
}