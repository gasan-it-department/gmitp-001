<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\GenerateObligationRequestRequest;

readonly class GenerateObligationRequestDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public string $obligationRequestNumber,
        public string $responsibilityCenter,
        public string $accountCode,
        public string $particulars,
        public string $mswdoPrintedName,
        public string $mswdoPosition,
        public string $budgetOfficerPrintedName,
        public string $budgetOfficerPosition,
        public ?string $office,
        public ?string $fpp,
    ) {}

    public static function fromRequest(
        GenerateObligationRequestRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            obligationRequestNumber: trim((string) $request->validated('obligation_request_number')),
            responsibilityCenter: trim((string) $request->validated('responsibility_center')),
            accountCode: trim((string) $request->validated('account_code')),
            particulars: trim((string) $request->validated('particulars')),
            mswdoPrintedName: trim((string) $request->validated('mswdo_printed_name')),
            mswdoPosition: trim((string) $request->validated('mswdo_position')),
            budgetOfficerPrintedName: trim((string) $request->validated('budget_officer_printed_name')),
            budgetOfficerPosition: trim((string) $request->validated('budget_officer_position')),
            office: self::nullableString($request->validated('office')),
            fpp: self::nullableString($request->validated('fpp')),
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
