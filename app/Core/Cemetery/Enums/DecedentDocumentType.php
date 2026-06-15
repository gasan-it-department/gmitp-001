<?php

namespace App\Core\Cemetery\Enums;

enum DecedentDocumentType: string
{
    case DEATH_CERTIFICATE = 'death_certificate';
    case FETAL_DEATH_CERTIFICATE = 'fetal_death_certificate';
    case BURIAL_PERMIT = 'burial_permit';
    case POLICE_REPORT = 'police_report';
    case MEDICO_LEGAL_REPORT = 'medico_legal_report';
    case HEALTH_OFFICE_CLEARANCE = 'health_office_clearance';
    case IDENTITY_EVIDENCE = 'identity_evidence';
    case CASE_PHOTO = 'case_photo';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::DEATH_CERTIFICATE => 'Death Certificate',
            self::FETAL_DEATH_CERTIFICATE => 'Fetal Death Certificate',
            self::BURIAL_PERMIT => 'Burial Permit',
            self::POLICE_REPORT => 'Police Report',
            self::MEDICO_LEGAL_REPORT => 'Medico-Legal Report',
            self::HEALTH_OFFICE_CLEARANCE => 'Health Office Clearance',
            self::IDENTITY_EVIDENCE => 'Identity Evidence',
            self::CASE_PHOTO => 'Restricted Case Photo',
            self::OTHER => 'Other',
        };
    }

    public function isRestricted(): bool
    {
        return in_array($this, [
            self::POLICE_REPORT,
            self::MEDICO_LEGAL_REPORT,
            self::IDENTITY_EVIDENCE,
            self::CASE_PHOTO,
        ], true);
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $type) => [
            'value' => $type->value,
            'label' => $type->label(),
            'restricted' => $type->isRestricted(),
        ], self::cases());
    }
}
