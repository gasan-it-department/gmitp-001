<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\PlotStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the "assign decedent to available plot" payload (REQ-3.1).
 *
 * Both the decedent and the plot must belong to the caller's municipality;
 * the plot must currently be AVAILABLE. The decedent must not already have an
 * active interment.
 */
class CreateIntermentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');

        return [
            'decedent_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_decedents', 'id')
                    ->where('municipal_id', $municipalId)
                    ->whereNull('deleted_at'),
                // Reject if the decedent is already interred/transferred
                // (only "exhumed" should be eligible for a re-interment, and
                // that flow has its own endpoint).
                Rule::unique('cemetery_interments', 'decedent_id')
                    ->where(fn ($q) => $q->whereIn('status', ['pending', 'interred'])
                        ->whereNull('deleted_at')),
            ],
            'plot_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_plots', 'id')
                    ->where('municipal_id', $municipalId)
                    ->where('status', PlotStatus::AVAILABLE->value)
                    ->whereNull('deleted_at'),
            ],
            'interment_date' => ['required', 'date', 'before_or_equal:today'],
            'status' => ['nullable', 'in:pending,interred'],
        ];
    }

    public function messages(): array
    {
        return [
            'decedent_id.exists' => 'The selected decedent does not belong to this municipality.',
            'decedent_id.unique' => 'This decedent already has an active interment record.',
            'plot_id.exists' => 'The selected plot is no longer available in this municipality.',
            'interment_date.before_or_equal' => 'The interment date cannot be in the future.',
        ];
    }
}
