<?php

namespace App\Core\Feedback\Enum;

enum FeedbackType: string
{
    case INQUIRY = 'inquiry';
    case COMPLAINT = 'complaint';
    case SUGGESTION = 'suggestion';
    case COMMENDATION = 'commendation';

    public function label()
    {
        return match ($this) {
            self::INQUIRY => 'General Inquiry',
            self::COMPLAINT => 'Report an Issue / Complaint',
            self::SUGGESTION => 'Make a Suggestion',
            self::COMMENDATION => 'Commendation / Praise',
        };
    }
    public static function toOptions()
    {
        return array_map(fn(self $case) => [
            'value' => $case->value,
            'label' => $case->label()
        ], self::cases());
    }
}