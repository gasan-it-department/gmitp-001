<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Payload validation for an ADMIN correction to a beneficiary's profile.
 *
 * Mirrors the identity / civil-status / income rules of
 * StoreWalkInBeneficiaryRequest, but as a correction it OMITS:
 *   • household_members  — roster edits go through their own endpoints
 *   • force              — there is no duplicate guard to override on an edit
 *   • terms_consent      — the original consent record is never re-captured here
 *   • address            — lives on the household, corrected via its own path
 *
 * Pure shape only — the tenant guard + Head-row sync live in
 * UpdateBeneficiaryProfileAction. The coarse admin gate (auth + admin +
 * permission) is enforced by the route middleware group, so authorize() is true.
 */
class UpdateBeneficiaryProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ── Personal identity ────────────────────────────────────────────
            'first_name'             => ['required', 'string', 'max:100'],
            'last_name'              => ['required', 'string', 'max:100'],
            'middle_name'            => ['nullable', 'string', 'max:100'],
            'suffix'                 => ['nullable', 'string', 'max:20'],
            'sex'                    => ['required', Rule::enum(Sex::class)],
            'birth_date'             => ['required', 'date', 'before:today'],
            'religion_id'            => ['nullable', 'ulid', 'exists:ac_religions,id'],
            'educational_attainment' => ['nullable', Rule::enum(EducationalAttainment::class)],

            // ── Civil status / employment / income ───────────────────────────
            'civil_status'   => ['required', Rule::enum(CivilStatus::class)],
            'occupation'     => ['nullable', 'string', 'max:120'],
            'monthly_income' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before'       => 'Date of birth must be in the past.',
            'sex.in'                  => 'Please select a valid sex option.',
            'religion_id.ulid'        => 'Invalid religion selection.',
            'religion_id.exists'      => 'The selected religion is no longer available.',
            'civil_status.required'   => 'Please select the beneficiary\'s civil status.',
            'occupation.required'     => 'Please describe the beneficiary\'s occupation (write "None" if unemployed).',
            'monthly_income.required' => 'Please enter the beneficiary\'s monthly income (enter 0 if none).',
            'monthly_income.min'      => 'Monthly income cannot be negative.',
        ];
    }

}
