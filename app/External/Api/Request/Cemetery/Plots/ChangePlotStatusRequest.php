<?php

namespace App\External\Api\Request\Cemetery\Plots;

use App\Core\Cemetery\Enums\PlotStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangePlotStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([PlotStatus::AVAILABLE->value, PlotStatus::MAINTENANCE->value])],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }
}
