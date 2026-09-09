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

    /** @return array<int, self> */
    public static function presentedCases(): array
    {
        return [
            self::Original,
            self::CertifiedTrueCopy,
            self::Photocopy,
        ];
    }

    /** @return array<int, string> */
    public static function presentedValues(): array
    {
        return array_map(fn (self $case) => $case->value, self::presentedCases());
    }

    /** @return array<int, array{value:string,label:string}> */
    public static function presentedOptions(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
            self::presentedCases(),
        );
    }

    public function accepts(?self $presented): bool
    {
        return match ($this) {
            self::Unspecified => true,
            self::Original => $presented === self::Original,
            self::CertifiedTrueCopy => $presented === self::CertifiedTrueCopy,
            self::OriginalOrCertifiedTrueCopy => in_array($presented, [self::Original, self::CertifiedTrueCopy], true),
            self::Photocopy => $presented === self::Photocopy,
        };
    }
}
