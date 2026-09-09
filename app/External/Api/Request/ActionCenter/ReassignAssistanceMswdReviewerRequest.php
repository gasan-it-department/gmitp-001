<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

class ReassignAssistanceMswdReviewerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('reason'))) {
            $this->merge(['reason' => trim($this->input('reason'))]);
        }
    }

    public function rules(): array
    {
        return [
            'reviewer_id' => ['required', 'ulid', 'exists:users,id'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ];
    }
}
