<?php

namespace App\External\Api\Request\SupportTicket;

use Illuminate\Foundation\Http\FormRequest;

class ReplyToTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body'          => ['required', 'string', 'max:5000'],
            'attachments'   => ['nullable', 'array', 'max:5'],
            'attachments.*' => [
                'file',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'body.required' => 'Please enter a message before sending.',
        ];
    }
}
