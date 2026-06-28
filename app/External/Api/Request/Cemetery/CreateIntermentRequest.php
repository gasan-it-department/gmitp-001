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

    protected function prepareForValidation(): void
    {
        $this->merge([
            'leaseholder_name' => is_string($this->input('leaseholder_name')) ? trim($this->input('leaseholder_name')) : $this->input('leaseholder_name'),
            'leaseholder_contact' => is_string($this->input('leaseholder_contact')) ? trim($this->input('leaseholder_contact')) : $this->input('leaseholder_contact'),
            'leaseholder_address' => is_string($this->input('leaseholder_address')) ? trim($this->input('leaseholder_address')) : $this->input('leaseholder_address'),
            'leaseholder_relationship' => is_string($this->input('leaseholder_relationship')) ? trim($this->input('leaseholder_relationship')) : $this->input('leaseholder_relationship'),
            'or_number' => is_string($this->input('or_number')) ? mb_strtoupper(trim($this->input('or_number'))) : $this->input('or_number'),
            'lease_notes' => is_string($this->input('lease_notes')) ? trim($this->input('lease_notes')) : $this->input('lease_notes'),
        ]);
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $cemeterySiteId = $this->input('cemetery_site_id');

        return [
            'cemetery_site_id' => [
                'nullable',
                'ulid',
                Rule::exists('cemetery_sites', 'id')
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],

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
                        ->when($cemeterySiteId, fn ($query) => $query->where('cemetery_site_id', $cemeterySiteId))
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

            'leaseholder_name' => ['required', 'string', 'max:255'],
            'leaseholder_contact' => ['nullable', 'string', 'max:100'],
            'leaseholder_address' => ['nullable', 'string', 'max:255'],
            'leaseholder_relationship' => ['nullable', 'string', 'max:100'],
            'lease_start' => ['nullable', 'date'],
            'lease_end' => ['nullable', 'date'],
            'amount_paid' => ['nullable', 'numeric', 'min:0', 'max:99999999.99', 'required_with:or_number'],
            'or_number' => [
                'nullable',
                'string',
                'max:100',
                'required_with:amount_paid',
                Rule::unique('cemetery_plot_leases', 'or_number')
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->whereNull('deleted_at')),
            ],
            'lease_notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            if (
                ! $this->filled('lease_end')
                || $validator->errors()->has('interment_date')
                || $validator->errors()->has('lease_start')
                || $validator->errors()->has('lease_end')
            ) {
                return;
            }

            $leaseStart = \Carbon\Carbon::parse($this->input('lease_start') ?: $this->input('interment_date'));
            $leaseEnd = \Carbon\Carbon::parse($this->input('lease_end'));

            if ($leaseEnd->lt($leaseStart)) {
                $validator->errors()->add('lease_end', 'The lease end date must be on or after the lease start date.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'cemetery_site_id.exists' => 'The selected cemetery site is not active or does not belong to this municipality.',
            'decedent_id.exists' => 'The selected decedent is not verified or does not belong to this municipality.',
            'decedent_id.unique' => 'This decedent already has an active interment record.',
            'plot_id.exists' => 'The selected plot is not an available, assignable slot in this municipality.',
            'interment_date.before_or_equal' => 'The interment date cannot be in the future.',
            'type.in' => 'Interment type must be either "initial" or "transfer".',
            'leaseholder_name.required' => 'Please enter the responsible leaseholder or contact person.',
            'amount_paid.required_with' => 'Please enter the amount paid when an OR number is provided.',
            'or_number.required_with' => 'Please enter the OR number when an amount paid is provided.',
            'or_number.unique' => 'This OR number is already recorded for another cemetery lease in this municipality.',
        ];
    }
}
