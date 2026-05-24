<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class RejectAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'remarks' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'remarks.required' => 'You must provide a reason for rejecting this request so the citizen understands why.',
            'remarks.min' => 'Please provide a clearer, more detailed reason for the rejection.',
        ];
    }

}