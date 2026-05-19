<?php

namespace App\External\Web\Request\ActionCenter;

use App\Core\ActionCenter\Enums\CivilStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProfileSetupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Personal identity ────────────────────────────────────────────
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'sex' => ['required', 'in:male,female'],
            'birth_date' => ['required', 'date', 'before:today'],
            'religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],
            'educational_attainment' => ['nullable', 'string', 'max:100'],

            // ── Civil status / employment / income ───────────────────────────
            // Required because these are the cornerstone of indigency
            // assessment on the MSWD paper intake form. Sourced from enum
            // values so additions there flow through automatically.
            'civil_status'   => ['required', Rule::in($this->civilStatusValues())],
            'occupation'     => ['required', 'string', 'max:120'],
            'monthly_income' => ['required', 'numeric', 'min:0', 'max:99999999.99'],

            // ── Home address ─────────────────────────────────────────────────
            'barangay' => ['required', 'string', 'max:100'],
            'barangay_code' => ['nullable', 'string', 'max:20'],
            'street' => ['nullable', 'string', 'max:255'],

            // ── Data Privacy Act (RA 10173) consent ──────────────────────────
            // Must be explicitly accepted — the DPA requires consent to be
            // freely given AND evidenced. We persist the timestamp + notice
            // version on ac_beneficiaries in the action layer.
            'terms_consent' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before' => 'Date of birth must be in the past.',
            'sex.in' => 'Please select a valid sex option.',
            'religion_id.ulid' => 'Invalid religion selection.',
            'religion_id.exists' => 'The selected religion is no longer available.',
            'civil_status.required' => 'Please select your civil status.',
            'occupation.required' => 'Please describe your current occupation (write "None" or "Unemployed" if applicable).',
            'monthly_income.required' => 'Please enter your monthly income (enter 0 if none).',
            'monthly_income.min' => 'Monthly income cannot be negative.',
            'terms_consent.accepted' => 'You must agree to the Data Privacy notice to complete your profile.',
        ];
    }

    /** @return array<int, string> */
    private function civilStatusValues(): array
    {
        return array_map(fn (CivilStatus $case) => $case->value, CivilStatus::cases());
    }
}
