<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceRequestDocumentCheckStatus: string
{
    case Pending = 'pending';
    case Verified = 'verified';
    case NeedsCorrection = 'needs_correction';

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
