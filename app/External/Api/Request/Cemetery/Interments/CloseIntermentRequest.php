<?php

namespace App\External\Api\Request\Cemetery\Interments;

use App\Core\Cemetery\Enums\CemeteryServiceRequestConsentMethod;
use App\Core\Cemetery\Enums\IntermentEndType;
use App\Core\Cemetery\Enums\PlotLeaseStatus;
use App\Core\Cemetery\Models\Interment;
use App\Core\Cemetery\Models\PlotLease;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Validation\Validator;

class CloseIntermentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'permit_reference' => is_string($this->input('permit_reference'))
                ? mb_strtoupper(trim($this->input('permit_reference')))
                : $this->input('permit_reference'),
            'transfer_destination' => is_string($this->input('transfer_destination'))
                ? trim($this->input('transfer_destination'))
                : $this->input('transfer_destination'),
        ]);
    }

    public function rules(): array
    {
        return [
            'end_type' => ['required', new Enum(IntermentEndType::class), 'not_in:'.IntermentEndType::MOVED->value],
            'ended_date' => ['required', 'date', 'before_or_equal:today'],
            'reason' => ['required', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'permit_reference' => ['nullable', 'string', 'max:150'],
            'transfer_destination' => ['nullable', 'required_if:end_type,'.IntermentEndType::TRANSFERRED_OUT->value, 'string', 'max:255'],
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
                    'Confirm that the active leaseholder authorized this request.'
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
            'end_type.not_in' => 'Use the Move Plot flow for internal cemetery movement.',
            'ended_date.before_or_equal' => 'The exhumation or transfer-out date cannot be in the future.',
            'transfer_destination.required_if' => 'Transfer destination is required when transferring remains out.',
            'requesting_party_name.required' => 'Enter the name of the person requesting this action.',
            'requesting_party_relationship.required' => 'Enter the requester relationship or role.',
            'authorization_evidence.mimes' => 'Authorization evidence must be a JPG, PNG, WEBP, or PDF file.',
            'authorization_evidence.max' => 'Authorization evidence must be 5 MB or smaller.',
        ];
    }

    private function hasConsentTargetLease(): bool
    {
        $intermentId = $this->route('interment_id');

        if (! is_string($intermentId) || $intermentId === '') {
            return false;
        }

        $plotId = Interment::query()
            ->where('municipal_id', app('municipal_id'))
            ->whereNull('ended_at')
            ->whereNull('voided_at')
            ->whereNull('deleted_at')
            ->where('id', $intermentId)
            ->value('plot_id');

        if (! is_string($plotId) || $plotId === '') {
            return false;
        }

        return PlotLease::query()
            ->where('municipal_id', app('municipal_id'))
            ->where('plot_id', $plotId)
            ->where('status', PlotLeaseStatus::ACTIVE->value)
            ->exists();
    }
}
