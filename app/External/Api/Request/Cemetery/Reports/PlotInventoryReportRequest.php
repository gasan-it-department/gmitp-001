<?php

namespace App\External\Api\Request\Cemetery\Reports;

use App\Core\Cemetery\Dto\Reports\PlotInventoryReportFiltersDto;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PlotInventoryReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'site_id' => ['nullable', 'ulid'],
            'section_id' => ['nullable', 'ulid'],
            'block_id' => ['nullable', 'ulid'],
            'type' => ['nullable', Rule::enum(PlotTypes::class)],
            'status' => ['nullable', Rule::enum(PlotStatus::class)],
            'occupancy_mode' => ['nullable', Rule::enum(PlotOccupancyMode::class)],
            'scope' => ['nullable', Rule::in([
                PlotInventoryReportFiltersDto::SCOPE_ASSIGNABLE,
                PlotInventoryReportFiltersDto::SCOPE_CONTAINERS,
                PlotInventoryReportFiltersDto::SCOPE_ALL,
            ])],
            'per_page' => ['nullable', 'integer', Rule::in([10, 15, 25, 50, 100])],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    public function filters(): array
    {
        return $this->safe()->only([
            'site_id',
            'section_id',
            'block_id',
            'type',
            'status',
            'occupancy_mode',
            'scope',
            'per_page',
        ]);
    }
}
