<?php

namespace App\External\Api\Request\CommunityReport\Admin;

use Illuminate\Foundation\Http\FormRequest;

class AcknowledgeReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'acknowledgement_note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
