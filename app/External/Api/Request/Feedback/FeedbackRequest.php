<?php

namespace App\External\Api\Request\Feedback;

use Illuminate\Foundation\Http\FormRequest;

class FeedbackRequest extends FormRequest
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
            'senderName' => 'nullable|string|max:255',
            'employeeName' => 'nullable|string|max:255',
            'subjectType' => 'required|string|in:department,employee',
            'departmentId' => 'nullable',
            'rating' => 'nullable|integer|max:5',
            'message' => 'required|string|max:255',
            'isAnonymous' => 'boolean',
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'is_anonymous' => filter_var($this->is_anonymous, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
// 'departmentId' => 'nullable|exists:departments,id|required_if:subject_type,department',
