<?php

namespace App\External\Api\Request\CommunityReport;

use Illuminate\Foundation\Http\FormRequest;

class CommunityReportRequest extends FormRequest
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

            'issue_type' => ['required', 'string'],

            'sender_name' => ['nullable', 'string'],

            'contact' => ['nullable', 'string'],

            'location' => ['required', 'string'],

            'description' => ['required', 'string'],

            'latitude' => ['required', 'numeric'],

            'longitude' => ['required', 'numeric'],

            'files' => ['nullable', 'array', 'max:5'],

            'files.*' => [
                'file',
                'mimes:jpg,jpeg,png,mp4,mov,avi',
                'max:51200',
            ],


        ];
    }
}
