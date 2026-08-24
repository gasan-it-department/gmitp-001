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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'max:10000'],
            'type' => ['sometimes', 'required', 'string', Rule::enum(EventType::class)],
            'start_datetime' => ['sometimes', 'required', 'date'],
            'end_datetime' => [
                'sometimes',
                'nullable',
                'date',
                Rule::when(
                    $this->filled('start_datetime') && $this->filled('end_datetime'),
                    ['after:start_datetime'],
                ),
            ],
            'location_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'is_published' => ['sometimes', 'boolean'],
            'event_banner' => [
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
            'end_datetime.after' => 'The end date must be after the start date.',
            'event_banner.max' => 'The banner image must be 10MB or smaller.',
        ];
    }
}
