<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class CreatePlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->route('cemetery_site_id');
        $blockId = $this->input('block_id');

        return [
            'block_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_blocks', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
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
            'name' => [
                'required',
                'string',
                'max:150',
                Rule::unique('cemetery_plots', 'name')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('block_id', $blockId)
                        ->whereNull('parent_plot_id')
                        ->whereNull('deleted_at')),
            ],
            'type' => ['required', new Enum(PlotTypes::class), Rule::notIn([PlotTypes::APARTMENT_NICHE->value])],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'block_id.exists' => 'The selected block is not part of this active cemetery site.',
            'name.unique' => 'A plot with this name already exists in the selected block.',
            'type.not_in' => 'Apartment niches must be generated through the apartment niche generator.',
            'capacity.min' => 'Capacity must be at least 1.',
            'capacity.max' => 'Capacity may not exceed 50. Large shared-capacity areas should be split into clearer records.',
        ];
    }
}
