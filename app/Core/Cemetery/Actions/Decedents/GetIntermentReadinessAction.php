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
        $decedent->loadMissing(['documents', 'unidentifiedDetail', 'readinessOverrides']);

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
        $override = $decedent->readinessOverrides
            ->filter(fn ($item) => $item->isUsable())
            ->sortByDesc('created_at')
            ->first();

        return [
            'ready' => $decedent->registration_status === RegistrationStatus::VERIFIED
                && ($missing === [] || $override !== null),
            'registration_verified' => $decedent->registration_status === RegistrationStatus::VERIFIED,
            'requirements' => $requirements,
            'missing' => $missing,
            'via_override' => $missing !== [] && $override !== null,
            'override' => $override ? [
                'id' => $override->id,
                'evidence_reference' => $override->evidence_reference,
                'expires_at' => $override->expires_at->toIso8601String(),
            ] : null,
        ];
    }
}
