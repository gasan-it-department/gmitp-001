<?php

namespace App\Core\Procurement\Enums;

enum ProcurementDocumentType: string
{
    case INVITATION = 'INVITATION';
    case BID_DOCS = 'BID_DOCS';
    case BULLETIN = 'BULLETIN';
    case BAC_RESOLUTION = 'BAC_RESOLUTION';
    case NOTICE_OF_AWARD = 'NOTICE_OF_AWARD';
    case CONTRACT = 'CONTRACT';
    case NOTICE_TO_PROCEED = 'NOTICE_TO_PROCEED';
    case OTHERS = 'OTHERS';


    public function label(): string
    {
        return match ($this) {
            self::INVITATION => 'Invitation to Bid / REOI',
            self::BID_DOCS => 'Bidding Documents',
            self::BULLETIN => 'Supplemental/Bid Bulletin',
            self::BAC_RESOLUTION => 'BAC Resolution',
            self::NOTICE_OF_AWARD => 'Notice of Award (NOA)',
            self::CONTRACT => 'Contract Agreement',
            self::NOTICE_TO_PROCEED => 'Notice to Proceed (NTP)',
            self::OTHERS => 'Other Supporting Documents',
        };
    }

    public static function toOptionsArray(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], ProcurementDocumentType::cases());
    }
}