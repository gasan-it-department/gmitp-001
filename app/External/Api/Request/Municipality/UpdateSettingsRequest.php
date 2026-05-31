<?php

namespace App\External\Api\Request\Municipality;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'primary_color_hex' => ['sometimes', 'nullable', 'regex:/^#?[0-9A-Fa-f]{3,8}$/'],
            'contact_email'     => ['sometimes', 'nullable', 'email', 'max:255'],
            'trunkline_phone'   => ['sometimes', 'nullable', 'string', 'max:255'],
            'office_hours'      => ['sometimes', 'nullable', 'string', 'max:255'],
            'facebook_url'      => ['sometimes', 'nullable', 'string', 'max:255'],

            'logo' => [
                'sometimes',
                'nullable',
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],

            'banners'   => ['sometimes', 'nullable', 'array', 'max:10'],
            'banners.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],

            'remove_banner_ids'   => ['sometimes', 'array'],
            'remove_banner_ids.*' => ['string'],
        ];
    }

    public function messages(): array
    {
        return [
            'primary_color_hex.regex' => 'The primary color must be a valid hex value (e.g. #1A2B3C).',
            'contact_email.email'     => 'Please provide a valid contact email address.',
            'logo.max'                => 'The logo must be 10MB or smaller.',
            'banners.max'             => 'You may upload up to 10 banners at a time.',
            'banners.*.max'           => 'Each banner must be 10MB or smaller.',
        ];
    }
}
