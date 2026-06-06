<?php

namespace App\External\Api\Request\SupportTicket;

use App\Core\SupportTicket\Enums\TicketCategory;
use App\Core\SupportTicket\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category'       => ['required', 'string', Rule::enum(TicketCategory::class)],
            'priority'       => ['sometimes', 'string', Rule::enum(TicketPriority::class)],
            'subject'        => ['required', 'string', 'max:160'],
            'description'    => ['required', 'string', 'max:5000'],

            // Contact details — required only for guests (no authenticated user).
            'contact_name'   => [Rule::requiredIf(fn () => $this->user() === null), 'nullable', 'string', 'max:120'],
            'contact_email'  => [Rule::requiredIf(fn () => $this->user() === null), 'nullable', 'email', 'max:160'],
            'contact_number' => ['nullable', 'string', 'max:32'],

            // Technical context (bug reports).
            'page_url'       => ['nullable', 'string', 'max:2048'],
            'app_version'    => ['nullable', 'string', 'max:32'],
            'environment'    => ['nullable', 'array'],

            'attachments'    => ['nullable', 'array', 'max:5'],
            'attachments.*'  => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'category.required'    => 'Please choose what your ticket is about.',
            'subject.required'     => 'Please provide a short subject.',
            'description.required' => 'Please describe your request or the problem.',
            'contact_email.email'  => 'Please provide a valid email address.',
            'attachments.max'      => 'You may attach up to 5 files.',
            'attachments.*.max'    => 'Each file must be 10MB or smaller.',
        ];
    }
}
