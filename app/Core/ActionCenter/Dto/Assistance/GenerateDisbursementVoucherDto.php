<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\GenerateDisbursementVoucherRequest;

readonly class GenerateDisbursementVoucherDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public ?string $disbursementVoucherNumber,
        public string $modeOfPayment,
        public ?string $tinEmployeeNumber,
        public string $obligationRequestNumber,
        public ?string $responsibilityCenterOffice,
        public string $responsibilityCenterCode,
        public string $explanation,
        public string $accountantPrintedName,
        public string $accountantPosition,
        public string $treasurerPrintedName,
        public string $treasurerPosition,
        public string $mayorPrintedName,
        public string $mayorPosition,
    ) {}

    public static function fromRequest(
        GenerateDisbursementVoucherRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            disbursementVoucherNumber: self::nullableString($request->validated('disbursement_voucher_number')),
            modeOfPayment: trim((string) $request->validated('mode_of_payment')),
            tinEmployeeNumber: self::nullableString($request->validated('tin_employee_number')),
            obligationRequestNumber: trim((string) $request->validated('obligation_request_number')),
            responsibilityCenterOffice: self::nullableString($request->validated('responsibility_center_office')),
            responsibilityCenterCode: trim((string) $request->validated('responsibility_center_code')),
            explanation: trim((string) $request->validated('explanation')),
            accountantPrintedName: trim((string) $request->validated('accountant_printed_name')),
            accountantPosition: trim((string) $request->validated('accountant_position')),
            treasurerPrintedName: trim((string) $request->validated('treasurer_printed_name')),
            treasurerPosition: trim((string) $request->validated('treasurer_position')),
            mayorPrintedName: trim((string) $request->validated('mayor_printed_name')),
            mayorPosition: trim((string) $request->validated('mayor_position')),
        );
    }

    private static function nullableString(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
