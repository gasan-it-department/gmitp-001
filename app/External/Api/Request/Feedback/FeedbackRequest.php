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
            'sender_name' => [
                'nullable',
                'string',
                'max:200',
                'regex:/^[A-Za-z\s]+$/'
            ],
            'employee_name' => [
                'nullable',
                'string',
                'max:200',
                'regex:/^[A-Za-z\s]+$/'
            ],
            'feedback_target' => 'required|string|in:department,employee',
            'department_id' => 'nullable',
            'rating' => 'nullable|integer|max:5',
            'feedback_message' => 'required|string|max:5000',
            'feedback_files' => 'nullable|array|max:5',
            'feedback_files.*' => 'file|mimetypes:image/jpeg,image/png,video/mp4,video/avi,video/mpeg|max:51200',
        ];

    }

}
// 'departmentId' => 'nullable|exists:departments,id|required_if:subject_type,department',
