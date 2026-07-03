<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class BulkGeneratePlotsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'label_prefix' => mb_strtoupper(trim((string) $this->input('label_prefix'))),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');
        $blockId = $this->route('block_id');

        return [
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
            'label_prefix' => ['required', 'string', 'max:50'],
            'start_number' => ['required', 'integer', 'min:0'],
            'quantity' => ['required', 'integer', 'min:1', 'max:500'],
            'padding' => ['required', 'integer', 'min:0', 'max:6'],
            'type' => ['required', new Enum(PlotTypes::class), Rule::notIn([PlotTypes::APARTMENT_NICHE->value])],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'area_sqm' => ['nullable', 'numeric', 'min:0.01', 'max:99999.99'],
        ];
    }

    public function validationData(): array
    {
        return array_merge(parent::validationData(), [
            'block' => $this->route('block_id'),
        ]);
    }

    public function messages(): array
    {
        return [
            'block.exists' => 'The selected block is not part of this active cemetery site.',
            'quantity.max' => 'You can generate up to 500 plots at a time.',
            'capacity.max' => 'Capacity may not exceed 50.',
            'type.not_in' => 'Apartment niches must be generated through the apartment niche generator.',
            'area_sqm.min' => 'Area must be at least 0.01 sqm when provided.',
            'area_sqm.max' => 'Area may not exceed 99,999.99 sqm.',
        ];
    }
}
