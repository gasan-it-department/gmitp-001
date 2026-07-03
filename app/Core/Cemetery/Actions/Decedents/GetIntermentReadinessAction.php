<?php

namespace App\Core\Cemetery\Actions\Decedents;

use App\Core\Cemetery\Enums\DecedentDocumentType;
use App\Core\Cemetery\Enums\IdentityStatus;
use App\Core\Cemetery\Enums\RegistrationStatus;
use App\Core\Cemetery\Enums\VitalRecordType;
use App\Core\Cemetery\Models\Decedent;

class GetIntermentReadinessAction
{
    public function execute(Decedent $decedent): array
    {
        $decedent->loadMissing(['documents', 'unidentifiedDetail']);

        $required = [
            $decedent->vital_record_type === VitalRecordType::FETAL_DEATH
                ? DecedentDocumentType::FETAL_DEATH_CERTIFICATE
                : DecedentDocumentType::DEATH_CERTIFICATE,
            DecedentDocumentType::BURIAL_PERMIT,
        ];

        if ($decedent->identity_status === IdentityStatus::UNIDENTIFIED) {
            $required[] = DecedentDocumentType::POLICE_REPORT;
            if ($decedent->unidentifiedDetail?->requires_medico_legal ?? true) {
                $required[] = DecedentDocumentType::MEDICO_LEGAL_REPORT;
            }
        }

        $attachedTypes = $decedent->documents
            ->pluck('type')
            ->map(fn ($type) => $type instanceof DecedentDocumentType ? $type->value : $type)
            ->all();

        $requirements = collect($required)->map(fn (DecedentDocumentType $type) => [
            'type' => $type->value,
            'label' => $type->label(),
            'satisfied' => in_array($type->value, $attachedTypes, true),
        ])->values()->all();

        $missing = collect($requirements)->where('satisfied', false)->pluck('type')->values()->all();
        $registrationVerified = $decedent->registration_status === RegistrationStatus::VERIFIED;
        $documentComplete = $missing === [];

        return [
            'ready' => $registrationVerified && $documentComplete,
            'interment_eligible' => $registrationVerified,
            'registration_verified' => $registrationVerified,
            'document_complete' => $documentComplete,
            'pending_documents' => $registrationVerified && ! $documentComplete,
            'requirements' => $requirements,
            'missing' => $missing,
        ];
    }
}
