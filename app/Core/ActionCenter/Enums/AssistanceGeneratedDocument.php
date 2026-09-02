<?php

namespace App\Core\ActionCenter\Enums;

enum AssistanceGeneratedDocument: string
{
    case RequestIntakeSheet = 'request_intake_sheet';
    case CertificateOfEligibility = 'certificate_of_eligibility';
    case ObligationRequest = 'obligation_request';
    case DisbursementVoucher = 'disbursement_voucher';
    case AcknowledgementReceipt = 'acknowledgement_receipt';

    public function label(): string
    {
        return match ($this) {
            self::RequestIntakeSheet => 'Request Intake Sheet',
            self::CertificateOfEligibility => 'Certificate of Eligibility',
            self::ObligationRequest => 'Obligation Request',
            self::DisbursementVoucher => 'Disbursement Voucher',
            self::AcknowledgementReceipt => 'Acknowledgement Receipt',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::RequestIntakeSheet => 'Prepare the two-page MSWDO intake and assessment sheet.',
            self::CertificateOfEligibility => 'Prepare the certificate confirming the client\'s eligibility for assistance.',
            self::ObligationRequest => 'Prepare the accounting Obligation Request after assistance approval.',
            self::DisbursementVoucher => 'Prepare the Disbursement Voucher used for payment processing.',
            self::AcknowledgementReceipt => 'Prepare the beneficiary receipt for physical signing during release.',
        };
    }

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(fn (self $document) => $document->value, self::cases());
    }

    /** @return array<int, string> */
    public static function defaultsForNewAssistanceType(): array
    {
        return [self::RequestIntakeSheet->value];
    }

    /** @return array<int, self> */
    public static function financialPacketCases(): array
    {
        return [
            self::CertificateOfEligibility,
            self::ObligationRequest,
            self::DisbursementVoucher,
        ];
    }

    /** @return array<int, array{value: string, label: string, description: string}> */
    public static function options(): array
    {
        return array_map(
            fn (self $document): array => [
                'value' => $document->value,
                'label' => $document->label(),
                'description' => $document->description(),
            ],
            self::cases(),
        );
    }
}
