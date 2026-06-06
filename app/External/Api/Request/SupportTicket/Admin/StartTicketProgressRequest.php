<?php

namespace App\External\Api\Request\SupportTicket\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StartTicketProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['nullable', 'string', 'max:120'],
        ];
    }
}
