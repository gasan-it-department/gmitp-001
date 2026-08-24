<?php

namespace App\External\Api\Request\Event;

use App\Core\Event\Enums\EventType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
            'type' => ['required', 'string', Rule::enum(EventType::class)],
            'start_datetime' => ['required', 'date'],
            'end_datetime' => ['nullable', 'date', 'after:start_datetime'],
            'location_name' => ['nullable', 'string', 'max:255'],
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
            'title.required' => 'Please provide an event title.',
            'description.required' => 'Please provide the event description.',
            'type.required' => 'Please choose an event type.',
            'start_datetime.required' => 'Please provide the event start date and time.',
            'end_datetime.after' => 'The end date must be after the start date.',
            'event_banner.max' => 'The banner image must be 10MB or smaller.',
        ];
    }
}
