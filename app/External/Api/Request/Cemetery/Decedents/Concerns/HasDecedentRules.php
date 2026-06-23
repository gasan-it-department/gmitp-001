<?php

namespace App\External\Api\Request\Cemetery\Decedents\Concerns;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

trait HasDecedentRules
{
    protected function decedentRules(?string $ignoreId = null): array
    {
        $municipalId = app('municipal_id');
        $submitting = $this->input('submission_intent') === 'submit';
        $identified = $this->input('identity_status') === IdentityStatus::IDENTIFIED->value;
        $unidentified = $this->input('identity_status') === IdentityStatus::UNIDENTIFIED->value;
        $fetal = $this->input('vital_record_type') === VitalRecordType::FETAL_DEATH->value;
        $legalName = filter_var($this->input('has_legal_name'), FILTER_VALIDATE_BOOLEAN);

        $registryRule = Rule::unique('cemetery_decedents', 'registry_number')
            ->where(fn ($query) => $query
                ->where('municipal_id', $municipalId)
                ->where('vital_record_type', $this->input('vital_record_type'))
                ->whereNull('deleted_at'));
        if ($ignoreId) {
            $registryRule->ignore($ignoreId);
        }

        $caseReferenceRule = Rule::unique('cemetery_unidentified_details', 'case_reference')
            ->where(fn ($query) => $query->where('municipal_id', $municipalId));
        if ($ignoreId) {
            $caseReferenceRule->ignore($ignoreId, 'decedent_id');
        }

        return [
            'vital_record_type' => ['required', new Enum(VitalRecordType::class)],
            'identity_status' => ['required', new Enum(IdentityStatus::class)],
            'has_legal_name' => ['required', 'boolean'],
            'submission_intent' => ['required', 'in:draft,submit'],
            'first_name' => [Rule::requiredIf($submitting && $identified && $legalName), 'nullable', 'string', 'max:100'],
            'last_name' => [Rule::requiredIf($submitting && $identified && $legalName), 'nullable', 'string', 'max:100'],
            'middle_name' => ['nullable', 'string', 'max:100'],
            'suffix' => ['nullable', 'string', 'max:20'],
            'memorial_name' => [Rule::requiredIf($submitting && $identified && ! $legalName), 'nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'in:MALE,FEMALE,INDETERMINATE'],
            'date_of_birth' => ['nullable', 'date', 'before_or_equal:today'],
            'date_of_death' => [Rule::requiredIf($submitting && ! $unidentified), 'nullable', 'date', 'before_or_equal:today', 'after_or_equal:date_of_birth'],
            'date_of_registration' => ['required', 'date', 'before_or_equal:today'],
            'registry_number' => [Rule::requiredIf($submitting && $identified), 'nullable', 'string', 'max:255', $registryRule],
            'cause_of_death' => ['nullable', 'string', 'max:255'],
            'place_of_death' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'psgc_municipality_id' => ['nullable', 'integer', 'exists:psgc_municipalities,id'],
            'psgc_barangay_code' => [
                'nullable',
                'string',
                'max:20',
                Rule::exists('psgc_barangays', 'psgc_code')->where(
                    fn ($query) => $query->where('municipality_id', $this->input('psgc_municipality_id'))
                ),
            ],
            'street_name' => ['nullable', 'string', 'max:150'],
            'avatar' => ['nullable', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'],

            'unidentified_details' => [Rule::requiredIf($submitting && $unidentified), 'nullable', 'array'],
            'unidentified_details.case_reference' => ['nullable', 'string', 'max:100', $caseReferenceRule],
            'unidentified_details.found_location' => [Rule::requiredIf($submitting && $unidentified), 'nullable', 'string', 'max:255'],
            'unidentified_details.date_found' => [Rule::requiredIf($submitting && $unidentified), 'nullable', 'date', 'before_or_equal:today'],
            'unidentified_details.reported_by' => ['nullable', 'string', 'max:255'],
            'unidentified_details.reporting_agency' => [Rule::requiredIf($submitting && $unidentified), 'nullable', 'string', 'max:255'],
            'unidentified_details.estimated_age' => ['nullable', 'string', 'max:100'],
            'unidentified_details.estimated_sex' => ['nullable', 'in:MALE,FEMALE,INDETERMINATE'],
            'unidentified_details.distinguishing_features' => ['nullable', 'string', 'max:2000'],
            'unidentified_details.physical_description' => [Rule::requiredIf($submitting && $unidentified), 'nullable', 'string', 'max:4000'],
            'unidentified_details.requires_medico_legal' => ['nullable', 'boolean'],

            'fetal_details' => [Rule::requiredIf($submitting && $fetal), 'nullable', 'array'],
            'fetal_details.gestational_age_weeks' => [Rule::requiredIf($submitting && $fetal), 'nullable', 'integer', 'min:1', 'max:45'],
            'fetal_details.fetal_weight_grams' => ['nullable', 'integer', 'min:1', 'max:10000'],
            'fetal_details.mother_name' => [Rule::requiredIf($submitting && $fetal), 'nullable', 'string', 'max:255'],
        ];
    }
}
