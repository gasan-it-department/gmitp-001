<?php

namespace App\External\Api\Request\ActionCenter\Walkin;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Payload validation for the admin-encoded WALK-IN beneficiary.
 *
 * Deliberately mirrors StoreProfileSetupRequest (the online path) field-for-
 * field so both intake forms accept identical data — pure shape only, no
 * business rules (the per-household cap + soft duplicate guard live in the
 * action layer).
 *
 * Two differences from the online request:
 *   • `terms_consent` here is the ADMIN's affirmation that the applicant gave
 *     RA 10173 consent in person and that the registry was checked first.
 *   • `force` lets the admin override the soft duplicate guard after reviewing
 *     the surfaced matches.
 *
 * The coarse admin gate (auth + admin + permission) is enforced by the route
 * middleware group, so authorize() is true.
 */
class StoreWalkInBeneficiaryRequest extends FormRequest
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
            'sex' => ['required', Rule::in($this->sexValues())],
            'birth_date' => ['required', 'date', 'before:today'],
            'religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],
            'educational_attainment' => ['nullable', 'string', 'max:100'],

            // ── Civil status / employment / income ───────────────────────────
            'civil_status' => ['required', Rule::in($this->civilStatusValues())],
            'occupation' => ['nullable', 'string', 'max:120'],
            'monthly_income' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],

            // ── Home address ─────────────────────────────────────────────────
            'barangay' => ['required', 'string', 'max:100'],
            'barangay_code' => ['nullable', 'string', 'max:20'],
            'street' => ['nullable', 'string', 'max:255'],

            // ── Admin affirmation (RA 10173 consent obtained + registry checked)
            'terms_consent' => ['required', 'accepted'],

            // ── Override the soft duplicate guard after admin review ──────────
            'force' => ['nullable', 'boolean'],
            'verify_now' => ['nullable', 'boolean'],

            // ── Household composition (optional) ─────────────────────────────
            'household_members' => ['nullable', 'array', 'max:'.StoreHouseholdMemberAction::ACTIVE_MEMBER_HARD_LIMIT],
            'household_members.*.first_name' => ['required_with:household_members.*', 'string', 'max:100'],
            'household_members.*.last_name' => ['required_with:household_members.*', 'string', 'max:100'],
            'household_members.*.middle_name' => ['nullable', 'string', 'max:100'],
            'household_members.*.suffix' => ['nullable', 'string', 'max:20'],
            'household_members.*.relationship' => ['required_with:household_members.*', Rule::in($this->relationshipValues())],
            'household_members.*.birth_date' => ['nullable', 'date', 'before_or_equal:today'],
            'household_members.*.sex' => ['nullable', Rule::in($this->sexValues())],
            'household_members.*.civil_status' => ['nullable', Rule::in($this->civilStatusValues())],
            'household_members.*.educational_attainment' => ['nullable', Rule::in($this->educationalAttainmentValues())],
            'household_members.*.occupation' => ['nullable', 'string', 'max:120'],
            'household_members.*.monthly_income' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
            'household_members.*.religion_id' => ['nullable', 'ulid', 'exists:ac_religions,id'],

            // Link-don't-duplicate: when the admin recognises a listed member is
            // already registered, the form may carry that beneficiary's id so the
            // row is linked at creation instead of duplicated. The action
            // re-verifies the id belongs to this municipality before linking.
            'household_members.*.beneficiary_id' => ['nullable', 'ulid', 'exists:ac_beneficiaries,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.before' => 'Date of birth must be in the past.',
            'sex.in' => 'Please select a valid sex option.',
            'religion_id.ulid' => 'Invalid religion selection.',
            'religion_id.exists' => 'The selected religion is no longer available.',
            'civil_status.required' => 'Please select the applicant\'s civil status.',
            'occupation.required' => 'Please describe the applicant\'s occupation (write "None" if unemployed).',
            'monthly_income.required' => 'Please enter the applicant\'s monthly income (enter 0 if none).',
            'monthly_income.min' => 'Monthly income cannot be negative.',
            'terms_consent.accepted' => 'Confirm the applicant gave consent and that you checked the registry for an existing record.',
        ];
    }

    /** @return array<int, string> */
    private function civilStatusValues(): array
    {
        return array_map(fn (CivilStatus $case) => $case->value, CivilStatus::cases());
    }

    /** @return array<int, string> */
    private function relationshipValues(): array
    {
        return array_map(fn (Relationship $case) => $case->value, Relationship::cases());
    }

    /** @return array<int, string> */
    private function sexValues(): array
    {
        return array_map(fn (Sex $case) => $case->value, Sex::cases());
    }

    /** @return array<int, string> */
    private function educationalAttainmentValues(): array
    {
        return array_map(fn (EducationalAttainment $case) => $case->value, EducationalAttainment::cases());
    }
}
