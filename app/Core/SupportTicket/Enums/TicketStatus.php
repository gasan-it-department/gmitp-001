<?php

namespace App\Core\SupportTicket\Enums;

enum TicketStatus: string
{
    case OPEN = 'open';
    case ACKNOWLEDGED = 'acknowledged';
    case IN_PROGRESS = 'in_progress';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';
    case REOPENED = 'reopened';

    public function description(): string
    {
        return match ($this) {
            self::OPEN => 'The ticket has been submitted and is awaiting initial review by support staff.',
            self::ACKNOWLEDGED => 'Support staff has reviewed the ticket and confirmed it is valid, but work has not yet started.',
            self::IN_PROGRESS => 'Support staff is actively working on the ticket.',
            self::RESOLVED => 'A resolution has been provided and the ticket is awaiting confirmation or closure.',
            self::CLOSED => 'The ticket has been closed and no further action is expected.',
            self::REOPENED => 'A previously resolved or closed ticket has been reopened for further work.',
        };
    }

    public function label(): string
    {
        return match ($this) {
            self::OPEN => 'Open',
            self::ACKNOWLEDGED => 'Acknowledged',
            self::IN_PROGRESS => 'In Progress',
            self::RESOLVED => 'Resolved',
            self::CLOSED => 'Closed',
            self::REOPENED => 'Reopened',
        };
    }

    public static function toOptions(): array
    {
        return array_map(fn (self $case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'description' => $case->description(),
        ], self::cases());
    }
}
