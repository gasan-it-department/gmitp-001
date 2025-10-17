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
            'contact_number' => 'nullable|string|min:10|max:15',
            'email' => 'nullable|email|max:255',
            'name' => 'nullable|string|max:255',
            'subject' => 'required|string|max:255',
            'subject_type' => 'required|string|in:department,individual',
            'department_id' => 'nullable|exists:departments,id|required_if:subject_type,department',
            'rating' => 'nullable|integer|min:1|max:5',
            'message' => 'required|string|max:5000',
            'is_anonymous' => 'boolean',
        ];
    }

    public function prepareForValidation(): void
    {
        $this->merge([
            'is_anonymous' => filter_var($this->is_anonymous, FILTER_VALIDATE_BOOLEAN),
        ]);
    }
}
