<?php

namespace App\External\Api\Request\Event;

use App\Core\Event\Enums\EventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'          => ['sometimes', 'required', 'string', 'max:255'],
            'description'    => ['sometimes', 'required', 'string', 'max:10000'],
            'type'           => ['sometimes', 'required', 'string', Rule::enum(EventType::class)],
            'start_datetime' => ['sometimes', 'required', 'date', 'before:end_datetime'],
            'end_datetime'   => ['sometimes', 'required', 'date', 'after_or_equal:start_datetime'],
            'location_name'  => ['sometimes', 'required', 'string', 'max:255'],
            'is_published'   => ['sometimes', 'boolean'],
            'event_banner'   => [
                'nullable',
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'start_datetime.before'       => 'The start date must be before the end date.',
            'end_datetime.after_or_equal' => 'The end date must be on or after the start date.',
            'event_banner.max'            => 'The banner image must be 10MB or smaller.',
        ];
    }
}
