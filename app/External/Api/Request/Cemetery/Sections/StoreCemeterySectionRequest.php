<?php

namespace App\External\Api\Request\Cemetery\Sections;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCemeterySectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('name')) {
            $this->merge(['name' => mb_strtoupper(trim((string) $this->input('name')))]);
        }
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');

        return [
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('cemetery_sections', 'name')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('cemetery_site_id', $cemeterySiteId)
                        ->whereNull('deleted_at')),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A section with this name already exists in this cemetery site.',
        ];
    }
}
