<?php

namespace App\External\Api\Request\Announcement;

use App\Core\Announcement\Enums\AnnouncementType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'        => ['sometimes', 'required', 'string', 'max:255'],
            'content'      => ['sometimes', 'required', 'string', 'max:10000'],
            'type'         => ['sometimes', 'required', 'string', Rule::enum(AnnouncementType::class)],
            'is_published' => ['sometimes', 'boolean'],
            'images'       => ['nullable', 'array', 'max:3'],
            'images.*'     => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'images.max'   => 'You may attach up to 3 images.',
            'images.*.max' => 'Each image must be 10MB or smaller.',
        ];
    }
}
