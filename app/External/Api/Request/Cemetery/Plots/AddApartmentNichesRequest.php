<?php

namespace App\External\Api\Request\Cemetery\Plots;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class AddApartmentNichesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'row_prefix' => mb_strtoupper(trim((string) $this->input('row_prefix', 'R'))),
            'niche_prefix' => mb_strtoupper(trim((string) $this->input('niche_prefix', 'N'))),
            'start_floor' => $this->input('start_floor', 1),
            'start_row' => $this->input('start_row', 1),
            'start_niche' => $this->input('start_niche', 1),
            'capacity_per_niche' => $this->input('capacity_per_niche', 1),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');
        $plotId = $this->route('plot_id');

        return [
            'site' => [
                Rule::exists('cemetery_sites', 'id')
                    ->where(fn ($query) => $query
                        ->where('id', $cemeterySiteId)
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],
            'plot' => [
                Rule::exists('cemetery_plots', 'id')
                    ->where(fn ($query) => $query
                        ->where('id', $plotId)
                        ->where('municipal_id', $municipalId)
                        ->where('cemetery_site_id', $cemeterySiteId)
                        ->whereNull('parent_plot_id')
                        ->where('type', 'apartment_niche')
                        ->where('occupancy_mode', 'slotted')
                        ->whereNull('deleted_at')),
            ],
            'start_floor' => ['required', 'integer', 'min:1', 'max:500'],
            'floors' => ['required', 'integer', 'min:1', 'max:20'],
            'start_row' => ['required', 'integer', 'min:1', 'max:500'],
            'rows_per_floor' => ['required', 'integer', 'min:1', 'max:50'],
            'start_niche' => ['required', 'integer', 'min:1', 'max:10000'],
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
                $validator->errors()->add('niches_per_row', 'You can add up to 500 apartment niche slots at a time.');
            }
        });
    }

    public function validationData(): array
    {
        return array_merge(parent::validationData(), [
            'site' => $this->route('cemetery_site_id'),
            'plot' => $this->route('plot_id'),
        ]);
    }

    public function messages(): array
    {
        return [
            'site.exists' => 'The selected cemetery site is not active or is not available in this municipality.',
            'plot.exists' => 'The selected plot is not an active apartment container in this cemetery site.',
        ];
    }
}
