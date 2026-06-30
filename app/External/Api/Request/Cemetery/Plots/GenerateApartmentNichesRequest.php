<?php

namespace App\External\Api\Request\Cemetery\Plots;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class GenerateApartmentNichesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'apartment_name' => mb_strtoupper(trim((string) $this->input('apartment_name'))),
            'row_prefix' => mb_strtoupper(trim((string) $this->input('row_prefix', 'R'))),
            'niche_prefix' => mb_strtoupper(trim((string) $this->input('niche_prefix', 'N'))),
            'capacity_per_niche' => $this->input('capacity_per_niche', 1),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');
        $blockId = $this->route('block_id');

        return [
            'site' => [
                Rule::exists('cemetery_sites', 'id')
                    ->where(fn ($query) => $query
                        ->where('id', $cemeterySiteId)
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],
            'block' => [
                Rule::exists('cemetery_blocks', 'id')
                    ->where(fn ($query) => $query
                        ->where('id', $blockId)
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereIn(
                            'section_id',
                            DB::table('cemetery_sections')
                                ->select('id')
                                ->where('municipal_id', $municipalId)
                                ->where('cemetery_site_id', $cemeterySiteId)
                                ->where('status', 'active')
                                ->whereNull('deleted_at')
                        )
                        ->whereNull('deleted_at')),
            ],
            'apartment_name' => ['required', 'string', 'max:80'],
            'floors' => ['required', 'integer', 'min:1', 'max:20'],
            'rows_per_floor' => ['required', 'integer', 'min:1', 'max:50'],
            'niches_per_row' => ['required', 'integer', 'min:1', 'max:100'],
            'row_prefix' => ['required', 'string', 'max:10'],
            'niche_prefix' => ['required', 'string', 'max:10'],
            'niche_padding' => ['required', 'integer', 'min:0', 'max:6'],
            'capacity_per_niche' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $floors = (int) $this->input('floors');
            $rows = (int) $this->input('rows_per_floor');
            $niches = (int) $this->input('niches_per_row');

            if ($floors > 0 && $rows > 0 && $niches > 0 && ($floors * $rows * $niches) > 500) {
                $validator->errors()->add('niches_per_row', 'You can generate up to 500 apartment niche slots at a time.');
            }
        });
    }

    public function validationData(): array
    {
        return array_merge(parent::validationData(), [
            'site' => $this->route('cemetery_site_id'),
            'block' => $this->route('block_id'),
        ]);
    }

    public function messages(): array
    {
        return [
            'site.exists' => 'The selected cemetery site is not active or is not available in this municipality.',
            'block.exists' => 'The selected block is not part of this active cemetery site.',
        ];
    }
}
