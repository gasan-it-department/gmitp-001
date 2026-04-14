<?php

namespace App\Core\Procurement\Enums;

enum ProcurementDocumentType: string
{
    // PRE-BID & OPEN PHASE
    case INVITATION = 'invitation';
    case BID_DOCS = 'bid_docs';
    case BULLETIN = 'bulletin';

    // EVALUATION PHASE
    case ABSTRACT_OF_BIDS = 'abstract_of_bids';
    case BAC_RESOLUTION = 'bac_resolution';

    // AWARD PHASE
    case NOTICE_OF_AWARD = 'notice_of_award';
    case CONTRACT = 'contract';
    case NOTICE_TO_PROCEED = 'notice_to_proceed';

    // FLEXIBLE
    case OTHERS = 'others';

    public function label(): string
    {
        return match ($this) {
            self::INVITATION => 'Invitation to Bid / REOI',
            self::BID_DOCS => 'Bidding Documents & Specs',
            self::BULLETIN => 'Supplemental/Bid Bulletin',

            self::ABSTRACT_OF_BIDS => 'Abstract of Bids / TWG Report',
            self::BAC_RESOLUTION => 'BAC Resolution',

            self::NOTICE_OF_AWARD => 'Notice of Award (NOA)',
            self::CONTRACT => 'Contract / Purchase Order (PO)',
            self::NOTICE_TO_PROCEED => 'Notice to Proceed (NTP)',

            self::OTHERS => 'Other Supporting Documents',
        };
    }

    /**
     * Defines which project statuses allow the upload of this document type.
     * This acts as the central rule engine for both the backend and frontend.
     */
    public function allowedStatuses(): array
    {
        return ProcurementStatus::cases(); // 🌟 Beautiful shortcut! Returns ALL cases automatically.
    }

    /**
     * Enhanced toOptionsArray to send the allowed statuses to React!
     */
    public static function toOptionsArray(): array
    {
        return array_map(fn($case) => [
            'value' => $case->value,
            'label' => $case->label(),
            'allowed_statuses' => $case->allowedStatuses(), // 🌟 Frontend can use this to filter!
        ], ProcurementDocumentType::cases());
    }
}