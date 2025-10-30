<?php

namespace app\External\Api\Request\BulletinBoard;

use Illuminate\Foundation\Http\FormRequest;

class AnnouncementRequest extends FormRequest
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
            'title' => [
                'required',
                'string',
                'min:5',
                'max:5000',
            ],

            'message' => [
                'required',
                'string',
                'min:5',
                'max:255',
            ],
        ];
    }

    protected function prepareForValidation()
    {
        $this->merge([
            'title' => trim($this->title),
            'message' => trim($this->message),
        ]);
    }

    public function messages(): array
    {
        return [
            'title.required' => 'A title is required for the announcement.',
            'title.min' => 'The announcement title must be at least 5 characters long.',
            'message.required' => 'The announcement content cannot be empty.',
            'message.min' => 'The announcement message should be at least 10 characters long.',
        ];
    }
}
