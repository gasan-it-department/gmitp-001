<?php

namespace App\Core\Cemetery\Enums;

enum CemeteryServiceRequestConsentMethod: string
{
    case LEASEHOLDER_PRESENT = 'leaseholder_present';
    case VERBAL_AUTHORIZATION = 'verbal_authorization';
    case WRITTEN_AUTHORIZATION = 'written_authorization';
    case FAMILY_ATTESTATION = 'family_attestation';
    case NOT_APPLICABLE = 'not_applicable';

    public function label(): string
    {
        return match ($this) {
            self::LEASEHOLDER_PRESENT => 'Leaseholder Present',
            self::VERBAL_AUTHORIZATION => 'Verbal Authorization',
            self::WRITTEN_AUTHORIZATION => 'Written Authorization',
            self::FAMILY_ATTESTATION => 'Family Attestation',
            self::NOT_APPLICABLE => 'Not Applicable',
        };
    }
}
