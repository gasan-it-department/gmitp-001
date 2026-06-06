<?php

namespace App\External\Api\Request\Feedback;

use Illuminate\Foundation\Http\FormRequest;

class SubmitFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'citizen_name'    => ['nullable', 'string', 'max:200'],
            'contact_number'  => ['nullable', 'string', 'max:50'],
            'email'           => ['nullable', 'email', 'max:200'],
            'employee_name'   => ['nullable', 'string', 'max:200'],
            'department_id'   => ['nullable', 'ulid', 'exists:departments,id'],
            'subject'         => ['required', 'string', 'max:255'],
            'message'         => ['required', 'string', 'max:5000'],
            'rating'          => ['nullable', 'integer', 'min:1', 'max:5'],
            'attachments'     => ['nullable', 'array', 'max:5'],
            'attachments.*'   => [
                'file',
                'mimetypes:image/jpeg,image/png,video/mp4,video/avi,video/mpeg',
                'max:51200',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'subject.required' => 'Please provide a subject for your feedback.',
            'message.required' => 'Please write your feedback message.',
            'rating.min'       => 'Rating must be between 1 and 5.',
            'rating.max'       => 'Rating must be between 1 and 5.',
            'attachments.max'  => 'You may attach up to 5 files.',
        ];
    }
}
