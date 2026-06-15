<?php

namespace App\Core\Cemetery\Enums;

enum RegistrationStatus: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case VERIFIED = 'verified';
    case ARCHIVED = 'archived';

    public function label(): string
    {
        return match ($this) {
            self::DRAFT => 'Draft',
            self::PENDING_REVIEW => 'Pending Review',
            self::VERIFIED => 'Verified',
            self::ARCHIVED => 'Archived',
        };
    }

    public function tone(): string
    {
        return match ($this) {
            self::DRAFT => 'slate',
            self::PENDING_REVIEW => 'amber',
            self::VERIFIED => 'emerald',
            self::ARCHIVED => 'rose',
        };
    }
}
