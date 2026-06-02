<?php

namespace App\External\Api\Request\CommunityReport\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StartReportProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assigned_to' => ['required', 'string', 'max:120'],
        ];
    }
}
