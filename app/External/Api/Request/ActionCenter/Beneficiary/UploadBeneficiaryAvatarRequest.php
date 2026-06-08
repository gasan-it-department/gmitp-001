<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload-shape validation for the admin "upload beneficiary photo" endpoint.
 *
 * Tenant + ownership rules live in UploadBeneficiaryAvatarAction. This only
 * checks the file: an image, one of the accepted types, under 5 MB (a webcam
 * snap is well within that). `authorize()` defers to the route's admin +
 * permission middleware.
 */
class UploadBeneficiaryAvatarRequest extends FormRequest
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
            'avatar.required' => 'Please choose a photo to upload.',
            'avatar.image'    => 'The profile photo must be an image.',
            'avatar.mimes'    => 'Use a JPG, PNG, or WEBP image.',
            'avatar.max'      => 'The photo must be 5 MB or smaller.',
        ];
    }
}
