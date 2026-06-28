<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Dto\Plots\PlotListFiltersDto;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListPlotsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'status' => ['nullable', Rule::enum(PlotStatus::class)],
            'type' => ['nullable', Rule::enum(PlotTypes::class)],
            'section_id' => ['nullable', 'ulid'],
            'block_id' => ['nullable', 'ulid'],
            'row' => ['nullable', 'string', 'max:50'],
            'scope' => ['nullable', Rule::in([
                PlotListFiltersDto::SCOPE_TOP_LEVEL,
                PlotListFiltersDto::SCOPE_ASSIGNABLE,
                PlotListFiltersDto::SCOPE_ALL,
            ])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
            'tab' => ['nullable', 'string', Rule::in(['overview', 'layout', 'plots', 'interments'])],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'search',
            'status',
            'type',
            'section_id',
            'block_id',
            'row',
            'scope',
            'per_page',
        ]);
    }
}
