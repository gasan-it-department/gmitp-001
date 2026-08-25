<?php

namespace App\Core\ActionCenter\Dto\Assistance;

use App\External\Api\Request\ActionCenter\GenerateFinancialDocumentPacketRequest;
use Carbon\CarbonImmutable;

readonly class GenerateFinancialDocumentPacketDto
{
    public function __construct(
        public string $assistanceRequestId,
        public string $municipalId,
        public CarbonImmutable $intakeDate,
        public string $obligationRequestNumber,
        public string $responsibilityCenter,
        public string $accountCode,
        public string $particulars,
        public ?string $office,
        public ?string $fpp,
        public ?string $disbursementVoucherNumber,
        public string $modeOfPayment,
        public ?string $tinEmployeeNumber,
        public string $explanation,
        public string $mswdoPrintedName,
        public string $mswdoPosition,
        public string $budgetOfficerPrintedName,
        public string $budgetOfficerPosition,
        public string $accountantPrintedName,
        public string $accountantPosition,
        public string $treasurerPrintedName,
        public string $treasurerPosition,
        public string $mayorPrintedName,
        public string $mayorPosition,
    ) {}

    public static function fromRequest(
        GenerateFinancialDocumentPacketRequest $request,
        string $assistanceRequestId,
        string $municipalId,
    ): self {
        return new self(
            assistanceRequestId: $assistanceRequestId,
            municipalId: $municipalId,
            intakeDate: CarbonImmutable::createFromFormat(
                '!Y-m-d',
                (string) $request->validated('intake_date'),
            ),
            obligationRequestNumber: trim((string) $request->validated('obligation_request_number')),
            responsibilityCenter: trim((string) $request->validated('responsibility_center')),
            accountCode: trim((string) $request->validated('account_code')),
            particulars: trim((string) $request->validated('particulars')),
            office: self::nullableString($request->validated('office')),
            fpp: self::nullableString($request->validated('fpp')),
            disbursementVoucherNumber: self::nullableString($request->validated('disbursement_voucher_number')),
            modeOfPayment: trim((string) $request->validated('mode_of_payment')),
            tinEmployeeNumber: self::nullableString($request->validated('tin_employee_number')),
            explanation: trim((string) $request->validated('explanation')),
            mswdoPrintedName: trim((string) $request->validated('mswdo_printed_name')),
            mswdoPosition: trim((string) $request->validated('mswdo_position')),
            budgetOfficerPrintedName: trim((string) $request->validated('budget_officer_printed_name')),
            budgetOfficerPosition: trim((string) $request->validated('budget_officer_position')),
            accountantPrintedName: trim((string) $request->validated('accountant_printed_name')),
            accountantPosition: trim((string) $request->validated('accountant_position')),
            treasurerPrintedName: trim((string) $request->validated('treasurer_printed_name')),
            treasurerPosition: trim((string) $request->validated('treasurer_position')),
            mayorPrintedName: trim((string) $request->validated('mayor_printed_name')),
            mayorPosition: trim((string) $request->validated('mayor_position')),
        );
    }

    public function obligationRequest(): GenerateObligationRequestDto
    {
        return new GenerateObligationRequestDto(
            assistanceRequestId: $this->assistanceRequestId,
            municipalId: $this->municipalId,
            obligationRequestNumber: $this->obligationRequestNumber,
            responsibilityCenter: $this->responsibilityCenter,
            accountCode: $this->accountCode,
            particulars: $this->particulars,
            mswdoPrintedName: $this->mswdoPrintedName,
            mswdoPosition: $this->mswdoPosition,
            budgetOfficerPrintedName: $this->budgetOfficerPrintedName,
            budgetOfficerPosition: $this->budgetOfficerPosition,
            office: $this->office,
            fpp: $this->fpp,
        );
    }

    public function disbursementVoucher(): GenerateDisbursementVoucherDto
    {
        return new GenerateDisbursementVoucherDto(
            assistanceRequestId: $this->assistanceRequestId,
            municipalId: $this->municipalId,
            disbursementVoucherNumber: $this->disbursementVoucherNumber,
            modeOfPayment: $this->modeOfPayment,
            tinEmployeeNumber: $this->tinEmployeeNumber,
            obligationRequestNumber: $this->obligationRequestNumber,
            responsibilityCenterOffice: $this->office,
            responsibilityCenterCode: $this->responsibilityCenter,
            explanation: $this->explanation,
            accountantPrintedName: $this->accountantPrintedName,
            accountantPosition: $this->accountantPosition,
            treasurerPrintedName: $this->treasurerPrintedName,
            treasurerPosition: $this->treasurerPosition,
            mayorPrintedName: $this->mayorPrintedName,
            mayorPosition: $this->mayorPosition,
        );
    }

    public function certificateOfEligibility(): GenerateCertificateOfEligibilityDto
    {
        return new GenerateCertificateOfEligibilityDto(
            assistanceRequestId: $this->assistanceRequestId,
            municipalId: $this->municipalId,
            intakeDate: $this->intakeDate,
            certifiedByName: $this->mswdoPrintedName,
            certifiedByPosition: $this->mswdoPosition,
            approvedByName: $this->mayorPrintedName,
            approvedByPosition: $this->mayorPosition,
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
