<?php

namespace App\External\Api\Request\Announcement;

use App\Core\Announcement\Enums\AnnouncementType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAnnouncementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:10000'],
            'type' => ['required', 'string', Rule::enum(AnnouncementType::class)],
            'is_published' => ['sometimes', 'boolean'],
            'images' => ['nullable', 'array', 'max:3'],
            'images.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Please provide an announcement title.',
            'content.required' => 'Please provide the announcement content.',
            'type.required' => 'Please choose an announcement type.',
            'images.max' => 'You may attach up to 3 images.',
            'images.*.max' => 'Each image must be 10MB or smaller.',
        ];
    }
}
