<?php

namespace App\External\Api\Request\Cemetery\Decedents;

use Illuminate\Foundation\Http\FormRequest;

class UploadDecedentAvatarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'avatar' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }

    public function messages(): array
    {
        return [
            'avatar.required' => 'Please choose a profile photo to upload.',
            'avatar.image' => 'The profile photo must be an image.',
            'avatar.mimes' => 'Use a JPG, PNG, or WEBP image.',
            'avatar.max' => 'The profile photo must be 5 MB or smaller.',
        ];
    }
}
