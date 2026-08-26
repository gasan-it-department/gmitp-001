<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class CancelApprovedAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'confirm_not_released' => ['required', 'accepted'],
            'confirm_papers_handled' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'Enter the administrative correction reason.',
            'reason.min' => 'Provide a clear reason of at least 10 characters.',
            'reason.max' => 'The correction reason must not exceed 1000 characters.',
            'confirm_not_released.accepted' => 'Confirm that no assistance was physically released.',
            'confirm_papers_handled.accepted' => 'Confirm that printed financial documents will be marked cancelled or destroyed.',
        ];
    }
}
