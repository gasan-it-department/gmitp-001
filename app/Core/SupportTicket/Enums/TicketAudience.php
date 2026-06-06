<?php

namespace App\Core\SupportTicket\Enums;

enum TicketAudience: string
{
    case CITIZEN = 'citizen';
    case STAFF = 'staff';

    public function label(): string
    {
        return match ($this) {
            self::CITIZEN => 'Citizen',
            self::STAFF => 'Staff / Internal',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
