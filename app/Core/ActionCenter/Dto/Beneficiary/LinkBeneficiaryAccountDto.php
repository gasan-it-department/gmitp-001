<?php

namespace App\Core\ActionCenter\Dto\Beneficiary;

use App\External\Api\Request\ActionCenter\Beneficiary\LinkBeneficiaryAccountRequest;

/**
 * Pure-primitives DTO for the "link / change a beneficiary's portal account"
 * workflow event.
 *
 * Carries ONLY scalar values — no models, no queries. The action layer resolves
 * the Beneficiary and the target User from these primitives.
 *
 * Three sources of data:
 *   • Route segment            → $beneficiaryId
 *   • Tenant + auth context    → $municipalId, $actingAdminId
 *   • Validated FormRequest    → $accountIdentifier, $reason
 *
 * $reason is optional for a FIRST link but the action requires it when CHANGING
 * an account that is already linked — moving a record to a different account is
 * sensitive and needs an audit rationale.
 */
readonly class LinkBeneficiaryAccountDto
{
    public function __construct(
        public string $beneficiaryId,
        public string $municipalId,
        public string $actingAdminId,
        public string $accountIdentifier,
        public ?string $reason,
    ) {}

    /**
     * Build from the validated FormRequest plus context resolved by the
     * controller (route param, tenant binding, auth).
     */
    public static function fromRequest(
        LinkBeneficiaryAccountRequest $request,
        string $beneficiaryId,
        string $municipalId,
        string $actingAdminId,
    ): self {
        $reason = $request->validated('reason');

        return new self(
            beneficiaryId: $beneficiaryId,
            municipalId: $municipalId,
            actingAdminId: $actingAdminId,
            accountIdentifier: trim((string) $request->validated('account_identifier')),
            reason: filled($reason) ? trim((string) $reason) : null,
        );
    }
}
