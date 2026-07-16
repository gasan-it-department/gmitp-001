<?php

namespace App\Core\Cemetery\Enums;

enum VitalRecordType: string
{
    case DEATH = 'death';
    case FETAL_DEATH = 'fetal_death';

    public function label(): string
    {
        return match ($this) {
            self::DEATH => 'Death',
            self::FETAL_DEATH => 'Fetal Death',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $type) => [
            'value' => $type->value,
            'label' => $type->label(),
        ], self::cases());
    }
}
