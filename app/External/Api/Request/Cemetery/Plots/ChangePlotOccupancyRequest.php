<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotOccupancyMode;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangePlotOccupancyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'occupancy_mode' => ['required', Rule::in([PlotOccupancyMode::SINGLE->value, PlotOccupancyMode::SHARED->value])],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
