<?php

namespace App\External\Api\Request\Department;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('code')) {
            $this->merge([
                'code' => strtoupper(trim((string) $this->input('code'))),
            ]);
        }
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $departmentId = $this->route('department');

        return [
            'name' => ['required', 'string', 'max:200'],
            'code' => [
                'required',
                'string',
                'max:20',
                Rule::unique('departments', 'code')
                    ->where(fn ($query) => $query->where('municipal_id', $municipalId)->whereNull('deleted_at'))
                    ->ignore($departmentId),
            ],
            'description' => ['nullable', 'string', 'max:5000'],
            'is_active' => ['nullable', 'boolean'],
            'logo' => [
                'nullable',
                'file',
                'image',
                'mimetypes:image/jpeg,image/png,image/webp',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Please provide a department name.',
            'code.required' => 'Please provide a department code (e.g., MEO).',
            'code.unique' => 'This department code is already in use for this municipality.',
            'logo.image' => 'Logo must be a valid image.',
            'logo.max' => 'Logo file size must not exceed 5MB.',
        ];
    }
}
