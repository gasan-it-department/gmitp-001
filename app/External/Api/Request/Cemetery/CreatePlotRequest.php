<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\PlotTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates a NEW plot creation. Single-purpose — the update flow gets its own
 * UpdatePlotRequest so unique-rule ignore logic stays explicit per intent.
 */
class CreatePlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');

        return [
            'section_id' => [
                'required',
                'ulid',
                // Scope: the section must belong to the caller's municipality so
                // you cannot quietly create a plot under another tenant's section.
                Rule::exists('cemetery_sections', 'id')->where('municipal_id', $municipalId),
            ],
            'plot_number' => [
                'required',
                'string',
                'max:50',
                Rule::unique('cemetery_plots', 'plot_number')
                    ->where(fn ($query) => $query->where('municipal_id', $municipalId)
                        ->whereNull('deleted_at')),
            ],
            'name' => ['nullable', 'string', 'max:150'],
            'type' => ['required', new Enum(PlotTypes::class)],
            'status' => ['nullable', new Enum(PlotStatus::class)],
            'total_capacity' => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'section_id.exists' => 'The selected section is not part of this municipality.',
            'plot_number.unique' => 'A plot with this number already exists in this municipality.',
        ];
    }
}
