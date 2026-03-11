<?php

namespace App\External\Api\Request\Government;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHistoryRequest extends FormRequest
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
            'actual_start_date' => ['required', 'date'],
            'actual_end_date' => ['required', 'date', 'after:actual_start_date'],
            'status' => ['required', 'string', 'in:resigned,deceased,promoted,others'],
            'remarks' => ['nullable', 'string', 'required_if:status,others', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'actual_end_date.after' => 'The conclusion date cannot be before the start date.',
            'remarks.required_if' => 'Please provide a reason in the remarks when using "Others".',
        ];
    }
}
