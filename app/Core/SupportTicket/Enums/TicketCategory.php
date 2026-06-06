<?php

namespace App\Core\SupportTicket\Enums;

enum TicketCategory: string
{
    case BUG = 'bug';
    case HELP = 'help';
    case FEATURE_REQUEST = 'feature_request';
    case ACCOUNT = 'account';
    case OTHER = 'other';

    public function label(): string
    {
        return match ($this) {
            self::BUG => 'Bug / Something is broken',
            self::HELP => 'Help / How do I…',
            self::FEATURE_REQUEST => 'Feature Request',
            self::ACCOUNT => 'Account / Access',
            self::OTHER => 'Other',
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
