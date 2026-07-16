<?php

namespace App\External\Api\Request\Cemetery\Sites;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCemeterySiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => is_string($this->input('name'))
                ? mb_strtoupper(trim($this->input('name')))
                : $this->input('name'),
            'psgc_barangay_code' => $this->clean($this->input('psgc_barangay_code')),
            'street_name' => $this->upper($this->input('street_name')),
            'notes' => $this->clean($this->input('notes')),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $psgcMunicipalityId = app('current_municipality')->psgc_municipal_id;
        $cemeterySiteId = $this->route('cemetery_site_id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('cemetery_sites', 'name')
                    ->ignore($cemeterySiteId)
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->whereNull('deleted_at')),
            ],
            'psgc_barangay_code' => [
                'nullable',
                'string',
                'max:20',
                Rule::exists('psgc_barangays', 'psgc_code')
                    ->where(fn ($query) => $query->where('municipality_id', $psgcMunicipalityId)),
            ],
            'street_name' => ['nullable', 'string', 'max:150'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['prohibited'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique' => 'A cemetery site with this name already exists in this municipality.',
            'psgc_barangay_code.exists' => 'The selected barangay does not belong to this municipality.',
            'status.prohibited' => 'Site status is changed through a separate status action.',
        ];
    }

    private function upper(mixed $value): mixed
    {
        $clean = $this->clean($value);

        return is_string($clean) ? mb_strtoupper($clean) : $clean;
    }

    private function clean(mixed $value): mixed
    {
        if (! is_string($value)) {
            return $value;
        }

        $trimmed = trim($value);

        return $trimmed === '' ? null : $trimmed;
    }
}
