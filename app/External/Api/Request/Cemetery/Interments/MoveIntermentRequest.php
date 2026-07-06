<?php

namespace App\External\Api\Request\Cemetery\Interments;

use App\Core\Cemetery\Enums\CemeteryServiceRequestConsentMethod;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\PlotLease;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class MoveIntermentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');
        $siteId = $this->input('destination_cemetery_site_id');

        return [
            'destination_cemetery_site_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_sites', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->where('status', 'active')
                        ->whereNull('deleted_at')),
            ],
            'destination_plot_id' => [
                'required',
                'ulid',
                Rule::exists('cemetery_plots', 'id')
                    ->where(fn ($query) => $query
                        ->where('municipal_id', $municipalId)
                        ->when($siteId, fn ($plotQuery) => $plotQuery->where('cemetery_site_id', $siteId))
                        ->whereNull('deleted_at')),
            ],
            'movement_date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
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
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if (! $this->hasConsentTargetLease()) {
                return;
            }

            if ($this->boolean('requester_is_leaseholder')) {
                return;
            }

            if (! $this->boolean('leaseholder_consent_confirmed')) {
                $validator->errors()->add(
                    'leaseholder_consent_confirmed',
                    'Confirm that the active leaseholder authorized this movement request.'
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
            'destination_cemetery_site_id.exists' => 'The selected cemetery site is not active or does not belong to this municipality.',
            'destination_plot_id.exists' => 'The selected destination plot does not belong to the selected cemetery site.',
            'movement_date.before_or_equal' => 'The movement date cannot be in the future.',
            'requesting_party_name.required' => 'Enter the name of the person requesting this movement.',
            'requesting_party_relationship.required' => 'Enter the requester relationship or role.',
            'authorization_evidence.mimes' => 'Authorization evidence must be a JPG, PNG, WEBP, or PDF file.',
            'authorization_evidence.max' => 'Authorization evidence must be 5 MB or smaller.',
        ];
    }

    private function hasConsentTargetLease(): bool
    {
        $municipalId = app('municipal_id');
        $destinationPlotId = $this->input('destination_plot_id');

        if (is_string($destinationPlotId) && $destinationPlotId !== '') {
            $hasDestinationLease = PlotLease::query()
                ->where('municipal_id', $municipalId)
                ->where('plot_id', $destinationPlotId)
                ->where('status', PlotLeaseStatus::ACTIVE->value)
                ->exists();

            if ($hasDestinationLease) {
                return true;
            }
        }

        $intermentId = $this->route('interment_id');
        if (! is_string($intermentId) || $intermentId === '') {
            return false;
        }

        $sourcePlotId = Interment::query()
            ->where('municipal_id', $municipalId)
            ->whereNull('ended_at')
            ->whereNull('voided_at')
            ->whereNull('deleted_at')
            ->where('id', $intermentId)
            ->value('plot_id');

        if (! is_string($sourcePlotId) || $sourcePlotId === '') {
            return false;
        }

        return PlotLease::query()
            ->where('municipal_id', $municipalId)
            ->where('plot_id', $sourcePlotId)
            ->where('status', PlotLeaseStatus::ACTIVE->value)
            ->exists();
    }
}
