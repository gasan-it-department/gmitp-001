<?php

namespace App\Core\ActionCenter\Enums;

/**
 * The MSWD assessment lifecycle is intentionally independent from the
 * financial decision stored on AssistanceRequest::status.
 */
enum MswdVerificationStatus: string
{
    case Pending = 'pending';
    case UnderReview = 'under_review';
    case NeedsCorrection = 'needs_correction';
    case Verified = 'verified';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'MSWD Pending',
            self::UnderReview => 'MSWD Under Review',
            self::NeedsCorrection => 'MSWD Needs Correction',
            self::Verified => 'MSWD Verified',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
