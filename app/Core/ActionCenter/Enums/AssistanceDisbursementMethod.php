<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceDisbursementMethod: string
{
    case Check = 'check';
    case Cash = 'cash';

    public function label(): string
    {
        return match ($this) {
            self::Check => 'Check',
            self::Cash => 'Cash',
        };
    }

    /** @return list<string> */
    public static function values(): array
    {
        return array_map(static fn (self $method): string => $method->value, self::cases());
    }
}
