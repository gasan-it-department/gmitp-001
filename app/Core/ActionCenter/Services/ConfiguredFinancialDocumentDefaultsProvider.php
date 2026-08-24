<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Contracts\FinancialDocumentDefaultsProvider;
use App\Core\ActionCenter\Dto\Assistance\FinancialDocumentDefaults;
use Illuminate\Contracts\Config\Repository as ConfigRepository;

class ConfiguredFinancialDocumentDefaultsProvider implements FinancialDocumentDefaultsProvider
{
    public function __construct(
        private readonly ConfigRepository $config,
    ) {}

    public function for(
        ?string $municipalCode,
        ?string $assistanceTypeSlug = null,
    ): FinancialDocumentDefaults {
        $defaults = $this->arrayValue(
            $this->config->get('action_center_financial_documents.defaults', []),
        );
        $municipality = $municipalCode === null
            ? []
            : $this->arrayValue($this->config->get(
                'action_center_financial_documents.municipalities.'.$municipalCode,
                [],
            ));
        $assistanceTypes = $this->arrayValue($municipality['assistance_types'] ?? []);

        unset($municipality['assistance_types']);

        $assistanceType = $assistanceTypeSlug === null
            ? []
            : $this->arrayValue($assistanceTypes[$assistanceTypeSlug] ?? []);
        $values = array_replace_recursive($defaults, $municipality, $assistanceType);

        return new FinancialDocumentDefaults(
            obligationRequestResponsibilityCenter: $this->stringValue($values, 'obligation_request.responsibility_center'),
            obligationRequestAccountCode: $this->stringValue($values, 'obligation_request.account_code'),
            obligationRequestOffice: $this->stringValue($values, 'obligation_request.office'),
            obligationRequestFpp: $this->stringValue($values, 'obligation_request.fpp'),
            obligationRequestMswdoPrintedName: $this->stringValue($values, 'obligation_request.mswdo_printed_name'),
            obligationRequestMswdoPosition: $this->stringValue($values, 'obligation_request.mswdo_position'),
            obligationRequestBudgetOfficerPrintedName: $this->stringValue($values, 'obligation_request.budget_officer_printed_name'),
            obligationRequestBudgetOfficerPosition: $this->stringValue($values, 'obligation_request.budget_officer_position'),
            disbursementVoucherResponsibilityCenterOffice: $this->stringValue($values, 'disbursement_voucher.responsibility_center_office'),
            disbursementVoucherResponsibilityCenterCode: $this->stringValue($values, 'disbursement_voucher.responsibility_center_code'),
            disbursementVoucherAccountantPrintedName: $this->stringValue($values, 'disbursement_voucher.accountant_printed_name'),
            disbursementVoucherAccountantPosition: $this->stringValue($values, 'disbursement_voucher.accountant_position'),
            disbursementVoucherTreasurerPrintedName: $this->stringValue($values, 'disbursement_voucher.treasurer_printed_name'),
            disbursementVoucherTreasurerPosition: $this->stringValue($values, 'disbursement_voucher.treasurer_position'),
            disbursementVoucherMayorPrintedName: $this->stringValue($values, 'disbursement_voucher.mayor_printed_name'),
            disbursementVoucherMayorPosition: $this->stringValue($values, 'disbursement_voucher.mayor_position'),
            certificateOfEligibilityCertifiedByName: $this->stringValue($values, 'certificate_of_eligibility.certified_by_name'),
            certificateOfEligibilityCertifiedByPosition: $this->stringValue($values, 'certificate_of_eligibility.certified_by_position'),
            certificateOfEligibilityApprovedByName: $this->stringValue($values, 'certificate_of_eligibility.approved_by_name'),
            certificateOfEligibilityApprovedByPosition: $this->stringValue($values, 'certificate_of_eligibility.approved_by_position'),
        );
    }

    /** @return array<string, mixed> */
    private function arrayValue(mixed $value): array
    {
        return is_array($value) ? $value : [];
    }

    /** @param array<string, mixed> $values */
    private function stringValue(array $values, string $key): string
    {
        $value = data_get($values, $key);

        return is_string($value) ? trim($value) : '';
    }
}
