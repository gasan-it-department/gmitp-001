<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;

class GetDecedentReviewErrorsAction
{
    public function execute(Decedent $decedent): array
    {
        $decedent->loadMissing(['unidentifiedDetail', 'fetalDeathDetail']);
        $errors = [];

        if ($decedent->identity_status !== IdentityStatus::UNIDENTIFIED && ! $decedent->date_of_death) {
            $errors['date_of_death'] = 'A date of death is required before verification.';
        } elseif ($decedent->date_of_birth && $decedent->date_of_death
            && $decedent->date_of_death->isBefore($decedent->date_of_birth)) {
            $errors['date_of_death'] = 'The date of death cannot be before the date of birth.';
        }

        if ($decedent->identity_status === IdentityStatus::IDENTIFIED) {
            if ($decedent->has_legal_name && (blank($decedent->first_name) || blank($decedent->last_name))) {
                $errors['name'] = 'The legal first and last name are required.';
            }
            if (! $decedent->has_legal_name && blank($decedent->memorial_name)) {
                $errors['memorial_name'] = 'A memorial display name is required.';
            }
            if (blank($decedent->registry_number)) {
                $errors['registry_number'] = 'The civil registry number is required.';
            } elseif (Decedent::query()
                ->where('municipal_id', $decedent->municipal_id)
                ->where('vital_record_type', $decedent->vital_record_type->value)
                ->where('registry_number', $decedent->registry_number)
                ->where('id', '!=', $decedent->id)
                ->exists()) {
                $errors['registry_number'] = 'The civil registry number is already used in this municipality.';
            }
        }

        if ($decedent->identity_status === IdentityStatus::UNIDENTIFIED) {
            $detail = $decedent->unidentifiedDetail;
            if (! $detail || blank($detail->case_reference) || blank($detail->found_location)
                || blank($detail->date_found) || blank($detail->reporting_agency)
                || blank($detail->physical_description)) {
                $errors['unidentified_details'] = 'Complete the unidentified-person case details.';
            }
        }

        if ($decedent->vital_record_type === VitalRecordType::FETAL_DEATH) {
            $detail = $decedent->fetalDeathDetail;
            if (! $detail || blank($detail->mother_name) || blank($detail->gestational_age_weeks)) {
                $errors['fetal_details'] = 'Mother name and gestational age are required for fetal death records.';
            }
        }

        return $errors;
    }
}
