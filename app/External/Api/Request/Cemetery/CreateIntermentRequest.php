<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Validates the "assign decedent to available slot" payload (REQ-3.1, FR-6).
 *
 * Tenancy + business invariants are enforced HERE for UX (early failure with a
 * clear message), and again defensively inside RecordIntermentAction so a
 * concurrent state change between request validation and the action cannot
 * sneak past the BR-1/BR-4 guards.
 *
 *   BR-1  Only AVAILABLE plots/slots accept an interment.
 *   BR-2  A decedent can have AT MOST ONE active (non-soft-deleted) interment.
 *   BR-4  Only a LEAF row can be interred into — never a parent container.
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
                // Must belong to this tenant and not be soft-deleted.
                Rule::exists('cemetery_decedents', 'id')
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->where('registration_status', RegistrationStatus::VERIFIED->value)
                        ->whereNull('deleted_at')),
                // BR-2 — reject if the decedent already has an ACTIVE interment.
                // In the event-typed schema, "active" = "not soft-deleted"
                // (exhumation / transfer soft-deletes the prior row).
                Rule::unique('cemetery_interments', 'decedent_id')
                    ->where(fn ($q) => $q->whereNull('deleted_at')),
            ],

            'plot_id' => [
                'required',
                'ulid',
                // BR-1 (AVAILABLE) + BR-4 (leaf-only) folded into one exists
                // check. A leaf is either a child slot (parent_plot_id IS NOT
                // NULL) OR a single-capacity plot (capacity = 1). Parent
                // containers fail closed here even if the UI sends one.
                Rule::exists('cemetery_plots', 'id')
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->where('status', PlotStatus::AVAILABLE->value)
                        ->whereNull('deleted_at')
                        ->where(function ($leaf) {
                            $leaf->whereNotNull('parent_plot_id')
                                ->orWhere('capacity', 1);
                        })),
            ],

            'interment_date' => ['required', 'date', 'before_or_equal:today'],

            // Event type — defaults to 'initial' at the DTO if omitted.
            // 'transfer' is set by the (future) TransferIntermentAction wrapper.
            'type' => ['sometimes', 'in:initial,transfer'],

            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'decedent_id.exists' => 'The selected decedent is not verified or does not belong to this municipality.',
            'decedent_id.unique' => 'This decedent already has an active interment record.',
            'plot_id.exists' => 'The selected plot is not an available, assignable slot in this municipality.',
            'interment_date.before_or_equal' => 'The interment date cannot be in the future.',
            'type.in' => 'Interment type must be either "initial" or "transfer".',
        ];
    }
}
