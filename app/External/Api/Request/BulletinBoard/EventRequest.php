<?php

namespace App\External\Api\Request\BulletinBoard;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:1000'],
            'event_date_time' => ['required', 'date', 'after_or_equal:today'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'The event title is required.',
            'message.required' => 'Please enter a message for the event.',
            'event_date_time.required' => 'An event date is required.',
            'event_date_time.after_or_equal' => 'The event date cannot be in the past.',
        ];
    }
}
