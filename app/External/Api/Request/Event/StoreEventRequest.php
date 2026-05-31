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
            'title'          => ['required', 'string', 'max:255'],
            'description'    => ['required', 'string', 'max:10000'],
            'type'           => ['required', 'string', Rule::enum(EventType::class)],
            'start_datetime' => ['required', 'date', 'before:end_datetime'],
            'end_datetime'   => ['required', 'date', 'after_or_equal:start_datetime'],
            'location_name'  => ['required', 'string', 'max:255'],
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
            'title.required'          => 'Please provide an event title.',
            'description.required'    => 'Please provide the event description.',
            'type.required'           => 'Please choose an event type.',
            'start_datetime.required' => 'Please provide the event start date and time.',
            'start_datetime.before'   => 'The start date must be before the end date.',
            'end_datetime.required'   => 'Please provide the event end date and time.',
            'end_datetime.after_or_equal' => 'The end date must be on or after the start date.',
            'location_name.required'  => 'Please provide the event location.',
            'event_banner.max'        => 'The banner image must be 10MB or smaller.',
        ];
    }
}
