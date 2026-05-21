<?php

namespace App\External\Api\Request\Cemetery;

use App\Core\Cemetery\Enums\DecedentTypes;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

/**
 * Validates the LGU admin payload when creating a NEW decedent record.
 *
 * Single-purpose: this request is wired only to the "register decedent" use case.
 * Do not reuse for updates — that flow gets its own UpdateDecedentRequest so the
 * unique-rule ignore logic and conditional clearing of fields stay explicit per
 * intent (layered request convention).
 *
 * Tenant boundary: municipal_id is NOT accepted from the payload — it is sourced
 * from the bound `municipal_id` container instance set by SetMunicipalityContext
 * middleware. This prevents cross-tenant writes from a forged form field.
 */
class CreateDecedentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route already enforces auth + admin + municipalityContext middleware.
        return true;
    }

    /**
     * Normalize the payload before validation so the request body always reflects
     * the chosen decedent_type semantics. This keeps the rules() section purely
     * declarative — no conditional clearing happens there.
     */
    public function prepareForValidation(): void
    {
        $type = $this->input('decedent_type');
        $hasOfficialName = filter_var($this->input('has_official_name'), FILTER_VALIDATE_BOOLEAN);

        if ($type === DecedentTypes::STANDARD->value) {
            $this->merge([
                'memorial_name' => null,
                'reference_document_type' => null,
                'reference_document_number' => null,
            ]);
            return;
        }

        if ($type === DecedentTypes::UNKNOWN->value) {
            $this->merge([
                'first_name' => null,
                'middle_name' => null,
                'last_name' => null,
                'suffix' => null,
                'memorial_name' => null,
                'death_certificate_no' => null,
            ]);
            return;
        }

        if (in_array($type, [DecedentTypes::FETAL->value, DecedentTypes::CHILD->value], true)) {
            $this->merge([
                'reference_document_type' => null,
                'reference_document_number' => null,
            ]);

            if (! $hasOfficialName) {
                $this->merge([
                    'first_name' => null,
                    'middle_name' => null,
                    'last_name' => null,
                    'suffix' => null,
                ]);
            }
        }
    }

    public function rules(): array
    {
        $municipalId = app('municipal_id');

        return [
            'decedent_type' => ['required', new Enum(DecedentTypes::class)],

            'first_name' => [
                Rule::requiredIf(fn () => $this->requiresLegalName()),
                'nullable',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s\.\-]+$/',
            ],
            'last_name' => [
                Rule::requiredIf(fn () => $this->requiresLegalName()),
                'nullable',
                'string',
                'max:100',
                'regex:/^[A-Za-z\s\-]+$/',
            ],
            'middle_name' => ['nullable', 'string', 'max:100', 'regex:/^[A-Za-z\s\-]+$/'],
            'suffix' => ['nullable', 'string', 'max:15', 'regex:/^[A-Za-z\s\.]+$/'],

            'memorial_name' => [
                Rule::requiredIf(fn () => $this->requiresMemorialName()),
                'nullable',
                'string',
                'max:255',
                'regex:/^[A-Za-z\s\.\-]+$/',
            ],

            'psgc_municipal_id' => ['nullable', 'string', 'max:100'],
            'psgc_barangay_id' => ['nullable', 'string', 'max:100', 'required_with:psgc_municipal_id'],
            'street_name' => ['nullable', 'string', 'max:150'],

            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => [
                'nullable',
                'date',
                'before_or_equal:today',
                'after_or_equal:date_of_birth',
            ],
            'date_of_registration' => ['required', 'date', 'before_or_equal:today'],

            'gender' => ['nullable', 'string', 'in:male,female,MALE,FEMALE'],
            'cause_of_death' => ['nullable', 'string', 'max:255'],
            'place_of_death' => ['nullable', 'string', 'max:255'],

            'reference_document_type' => [
                'nullable',
                'string',
                'max:100',
                Rule::requiredIf(fn () => $this->input('decedent_type') === DecedentTypes::UNKNOWN->value),
            ],
            'reference_document_number' => [
                'nullable',
                'string',
                'max:100',
                Rule::requiredIf(fn () => $this->input('decedent_type') === DecedentTypes::UNKNOWN->value),
            ],

            'death_certificate_no' => [
                'nullable',
                'string',
                'max:255',
                // Partial unique index scoped per tenant — mirror that constraint here
                // so duplicate-within-municipality is caught before insert.
                Rule::unique('cemetery_decedents', 'death_certificate_no')
                    ->where(fn ($query) => $query->where('municipal_id', $municipalId)
                        ->whereNull('deleted_at')),
            ],

            'notes' => [
                'nullable',
                'string',
                'max:1000',
                Rule::requiredIf(fn () => $this->input('decedent_type') === DecedentTypes::UNKNOWN->value),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'date_of_birth.before_or_equal' => 'The date of birth cannot be in the future.',
            'date_of_death.before_or_equal' => 'The date of death cannot be in the future.',
            'date_of_death.after_or_equal' => 'The date of death cannot be earlier than the date of birth.',
            'gender.in' => 'Please select a valid gender from the list.',
            'death_certificate_no.unique' => 'This death certificate number is already registered in this municipality.',
            'reference_document_type.required_if' => 'An authorizing document is legally required for unidentified bodies.',
            'reference_document_number.required_if' => 'Please enter the blotter or case number provided by the agency.',
            'memorial_name.required_if' => 'A memorial name is required when no official name is available.',
            'notes.required_if' => 'Please provide additional context for unknown decedents.',
            'psgc_barangay_id.required_with' => 'Please select a barangay for the chosen municipality.',
        ];
    }

    /**
     * Standard decedents and fetal/child decedents with an official name
     * require legal first/last name fields. Centralised so first_name and
     * last_name rules cannot drift.
     */
    private function requiresLegalName(): bool
    {
        $type = $this->input('decedent_type');

        if ($type === DecedentTypes::STANDARD->value) {
            return true;
        }

        $isChildLike = in_array($type, [DecedentTypes::FETAL->value, DecedentTypes::CHILD->value], true);
        $hasOfficial = filter_var($this->input('has_official_name'), FILTER_VALIDATE_BOOLEAN);

        return $isChildLike && $hasOfficial;
    }

    /**
     * Fetal/child decedents without an official name must supply a memorial name
     * (e.g. "Baby of Maria") per REQ-1.3.
     */
    private function requiresMemorialName(): bool
    {
        $isChildLike = in_array($this->input('decedent_type'), [
            DecedentTypes::FETAL->value,
            DecedentTypes::CHILD->value,
        ], true);

        $noOfficial = ! filter_var($this->input('has_official_name'), FILTER_VALIDATE_BOOLEAN);

        return $isChildLike && $noOfficial;
    }
}
