<?php

namespace App\External\Api\Request\Cemetery\Blocks;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCemeteryBlockRequest extends FormRequest
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
        $sectionId = $this->route('section_id');

        return [
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('cemetery_blocks', 'name')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('section_id', $sectionId)
                        ->whereNull('deleted_at')),
            ],
            'section' => [
                Rule::exists('cemetery_sections', 'id')
                    ->where(fn ($query) => $query
                        ->where('id', $sectionId)
                        ->where('municipal_id', $municipalId)
                        ->where('cemetery_site_id', $cemeterySiteId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],
        ];
    }

    public function validationData(): array
    {
        return array_merge(parent::validationData(), [
            'section' => $this->route('section_id'),
        ]);
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A block with this name already exists in this section.',
            'section.exists' => 'The selected section is not part of this active cemetery site.',
        ];
    }
}
