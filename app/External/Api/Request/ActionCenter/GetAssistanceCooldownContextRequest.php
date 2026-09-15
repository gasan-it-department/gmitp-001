<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class GetAssistanceCooldownContextRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'release_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
        ];
    }
}
