<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\CemeteryServiceRequestConsentMethod;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Enums\PlotOccupancyMode;
use App\Core\Cemetery\Enums\PlotStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Models\PlotLease;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

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
                    ->where(fn ($q) => $q
                        ->whereNull('ended_at')
                        ->whereNull('voided_at')
                        ->whereNull('deleted_at')),
            ],

            'plot_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_plots', 'id')
                    ->where(fn ($q) => $q
                        ->where('municipal_id', $municipalId)
                        ->when($cemeterySiteId, fn ($query) => $query->where('cemetery_site_id', $cemeterySiteId))
                        ->whereNull('deleted_at')
                        ->where(function ($assignable) {
                            $assignable->where(function ($single) {
                                $single
                                    ->where('occupancy_mode', PlotOccupancyMode::SINGLE->value)
                                    ->where('status', PlotStatus::AVAILABLE->value)
                                    ->whereRaw('(
                                        select count(*)
                                        from cemetery_interments
                                        where cemetery_interments.plot_id = cemetery_plots.id
                                        and cemetery_interments.ended_at is null
                                        and cemetery_interments.voided_at is null
                                        and cemetery_interments.deleted_at is null
                                    ) = 0');
                            })->orWhere(function ($shared) {
                                $shared
                                    ->where('occupancy_mode', PlotOccupancyMode::SHARED->value)
                                    ->whereIn('status', [PlotStatus::AVAILABLE->value, PlotStatus::OCCUPIED->value])
                                    ->whereRaw('(
                                        select count(*)
                                        from cemetery_interments
                                        where cemetery_interments.plot_id = cemetery_plots.id
                                        and cemetery_interments.ended_at is null
                                        and cemetery_interments.voided_at is null
                                        and cemetery_interments.deleted_at is null
                                    ) < cemetery_plots.capacity');
                            });
                        })),
            ],

            'interment_date' => ['required', 'date', 'before_or_equal:today'],

            // Event type — defaults to 'initial' at the DTO if omitted.
            // 'transfer' is set by the (future) TransferIntermentAction wrapper.
            'type' => ['sometimes', 'in:initial'],

            'notes' => ['nullable', 'string', 'max:1000'],

            'pending_document_reason' => ['nullable', 'string', 'max:1000'],
            'pending_document_reference' => ['nullable', 'string', 'max:255'],
            'pending_document_confirmed' => ['nullable', 'boolean'],

            'requesting_party_name' => ['required', 'string', 'max:255'],
            'requesting_party_contact' => ['nullable', 'string', 'max:100'],
            'requesting_party_address' => ['nullable', 'string', 'max:500'],
            'requesting_party_relationship' => ['required', 'string', 'max:100'],
            'requester_is_leaseholder' => ['nullable', 'boolean'],
            'leaseholder_consent_confirmed' => ['nullable', 'boolean'],
            'leaseholder_consent_method' => ['nullable', Rule::enum(CemeteryServiceRequestConsentMethod::class)],
            'leaseholder_consent_reference' => ['nullable', 'string', 'max:500'],
            'service_request_notes' => ['nullable', 'string', 'max:1000'],
            'authorization_evidence' => ['nullable', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:5120'],

            'leaseholder_name' => ['prohibited'],
            'leaseholder_contact' => ['prohibited'],
            'leaseholder_address' => ['prohibited'],
            'leaseholder_relationship' => ['prohibited'],
            'lease_start' => ['prohibited'],
            'lease_end' => ['prohibited'],
            'amount_paid' => ['prohibited'],
            'or_number' => ['prohibited'],
            'lease_notes' => ['prohibited'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $plotId = $this->input('plot_id');
            if (! is_string($plotId) || $plotId === '') {
                return;
            }

            $hasActiveLease = PlotLease::query()
                ->where('municipal_id', app('municipal_id'))
                ->where('plot_id', $plotId)
                ->where('status', PlotLeaseStatus::ACTIVE->value)
                ->exists();

            if (! $hasActiveLease || $this->boolean('requester_is_leaseholder')) {
                return;
            }

            if (! $this->boolean('leaseholder_consent_confirmed')) {
                $validator->errors()->add(
                    'leaseholder_consent_confirmed',
                    'Confirm that the active leaseholder authorized this interment request.'
                );
            }

            $method = $this->input('leaseholder_consent_method');
            if (! is_string($method) || $method === '' || $method === CemeteryServiceRequestConsentMethod::NOT_APPLICABLE->value) {
                $validator->errors()->add(
                    'leaseholder_consent_method',
                    'Select how the active leaseholder authorization was confirmed.'
                );
            }

            $reference = trim((string) $this->input('leaseholder_consent_reference', ''));
            if ($reference === '') {
                $validator->errors()->add(
                    'leaseholder_consent_reference',
                    'Enter the authorization reference or proof note.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'cemetery_site_id.exists' => 'The selected cemetery site is not active or does not belong to this municipality.',
            'decedent_id.exists' => 'The selected decedent is not verified or does not belong to this municipality.',
            'decedent_id.unique' => 'This decedent already has an active interment record.',
            'plot_id.exists' => 'The selected plot is not assignable or has already reached capacity.',
            'interment_date.before_or_equal' => 'The interment date cannot be in the future.',
            'type.in' => 'Use the Move Interment flow to create transfer records.',
            'pending_document_reason.max' => 'The pending-document reason must not exceed 1000 characters.',
            'pending_document_reference.max' => 'The follow-up reference must not exceed 255 characters.',
            'requesting_party_name.required' => 'Enter the name of the person requesting this interment.',
            'requesting_party_relationship.required' => 'Enter the requester relationship or role.',
            'leaseholder_consent_method' => 'Select a valid leaseholder consent method.',
            'authorization_evidence.mimes' => 'Authorization evidence must be a JPG, PNG, WEBP, or PDF file.',
            'authorization_evidence.max' => 'Authorization evidence must be 5 MB or smaller.',
            'leaseholder_name.prohibited' => 'Leaseholder details are managed from the Plot Profile after interment.',
            'leaseholder_contact.prohibited' => 'Leaseholder details are managed from the Plot Profile after interment.',
            'leaseholder_address.prohibited' => 'Leaseholder details are managed from the Plot Profile after interment.',
            'leaseholder_relationship.prohibited' => 'Leaseholder details are managed from the Plot Profile after interment.',
            'lease_start.prohibited' => 'Lease dates are managed from the Plot Profile after interment.',
            'lease_end.prohibited' => 'Lease dates are managed from the Plot Profile after interment.',
            'amount_paid.prohibited' => 'Payment details are managed from the Plot Profile after interment.',
            'or_number.prohibited' => 'Payment details are managed from the Plot Profile after interment.',
            'lease_notes.prohibited' => 'Lease notes are managed from the Plot Profile after interment.',
        ];
    }
}
