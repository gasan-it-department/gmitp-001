<?php

namespace App\Core\ActionCenter\Dto\Assistance;

readonly class FinancialDocumentDefaults
{
    public function __construct(
        public string $obligationRequestNumberPrefix,
        public string $obligationRequestResponsibilityCenter,
        public string $obligationRequestAccountCode,
        public string $obligationRequestOffice,
        public string $obligationRequestFpp,
        public string $obligationRequestMswdoPrintedName,
        public string $obligationRequestMswdoPosition,
        public string $obligationRequestBudgetOfficerPrintedName,
        public string $obligationRequestBudgetOfficerPosition,
        public string $disbursementVoucherResponsibilityCenterOffice,
        public string $disbursementVoucherResponsibilityCenterCode,
        public string $disbursementVoucherAccountantPrintedName,
        public string $disbursementVoucherAccountantPosition,
        public string $disbursementVoucherTreasurerPrintedName,
        public string $disbursementVoucherTreasurerPosition,
        public string $disbursementVoucherMayorPrintedName,
        public string $disbursementVoucherMayorPosition,
        public string $certificateOfEligibilityCertifiedByName,
        public string $certificateOfEligibilityCertifiedByPosition,
        public string $certificateOfEligibilityApprovedByName,
        public string $certificateOfEligibilityApprovedByPosition,
    ) {}

    /** @return array<string, string> */
    public function obligationRequest(): array
    {
        return [
            'number_prefix' => $this->obligationRequestNumberPrefix,
            'responsibility_center' => $this->obligationRequestResponsibilityCenter,
            'account_code' => $this->obligationRequestAccountCode,
            'office' => $this->obligationRequestOffice,
            'fpp' => $this->obligationRequestFpp,
            'mswdo_printed_name' => $this->obligationRequestMswdoPrintedName,
            'mswdo_position' => $this->obligationRequestMswdoPosition,
            'budget_officer_printed_name' => $this->obligationRequestBudgetOfficerPrintedName,
            'budget_officer_position' => $this->obligationRequestBudgetOfficerPosition,
        ];
    }

    /** @return array<string, string> */
    public function disbursementVoucher(): array
    {
        return [
            'responsibility_center_office' => $this->disbursementVoucherResponsibilityCenterOffice,
            'responsibility_center_code' => $this->disbursementVoucherResponsibilityCenterCode,
            'accountant_printed_name' => $this->disbursementVoucherAccountantPrintedName,
            'accountant_position' => $this->disbursementVoucherAccountantPosition,
            'treasurer_printed_name' => $this->disbursementVoucherTreasurerPrintedName,
            'treasurer_position' => $this->disbursementVoucherTreasurerPosition,
            'mayor_printed_name' => $this->disbursementVoucherMayorPrintedName,
            'mayor_position' => $this->disbursementVoucherMayorPosition,
        ];
    }

    /** @return array<string, string> */
    public function certificateOfEligibility(): array
    {
        return [
            'certified_by_name' => $this->certificateOfEligibilityCertifiedByName,
            'certified_by_position' => $this->certificateOfEligibilityCertifiedByPosition,
            'approved_by_name' => $this->certificateOfEligibilityApprovedByName,
            'approved_by_position' => $this->certificateOfEligibilityApprovedByPosition,
        ];
    }
}
