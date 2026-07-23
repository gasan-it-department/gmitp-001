<?php

namespace App\Core\ActionCenter\Enums;

enum PhysicalCopyRequirement: string
{
    case Unspecified = 'unspecified';
    case Original = 'original';
    case CertifiedTrueCopy = 'certified_true_copy';
    case OriginalOrCertifiedTrueCopy = 'original_or_certified_true_copy';
    case Photocopy = 'photocopy';

    public function label(): string
    {
        return match ($this) {
            self::Unspecified => 'Not specified',
            self::Original => 'Original',
            self::CertifiedTrueCopy => 'Certified True Copy',
            self::OriginalOrCertifiedTrueCopy => 'Original or Certified True Copy',
            self::Photocopy => 'Photocopy',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }
}
