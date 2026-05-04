<?php

namespace App\Core\ActionCenter\Enums;

enum Sex: string
{
    case MALE = 'male';
    case FEMALE = 'female';

    public function label()
    {
        return match ($this) {
            self::MALE => 'Male',
            self::FEMALE => 'Female'
        };
    }

    public static function option()
    {
        return collect(self::cases())
            ->map(fn($case) => [
                'value' => $case->value,
                'label' => $case->label(),
            ])->toArray();
    }
}