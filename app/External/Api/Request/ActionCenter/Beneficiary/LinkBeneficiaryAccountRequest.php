<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload validation for the admin "link / change a beneficiary's portal
 * account" action.
 *
 * Pure-shape only — no business rules, no model lookups. The action
 * (LinkBeneficiaryToUserAction) resolves the account by email within the
 * tenant, enforces the one-account-one-beneficiary invariant, and requires a
 * reason when re-pointing an existing link.
 *
 * Fields:
 *   • account_email → the email the applicant registered their portal account
 *     with. Resolved case-insensitively and scoped to the municipality.
 *   • reason        → optional for a first link; the action makes it mandatory
 *     when CHANGING an already-linked account (kept nullable here so the
 *     FormRequest stays pure-shape and needs no DB read).
 */
class LinkBeneficiaryAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'account_email' => ['required', 'string', 'email', 'max:255'],
            'reason'        => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'account_email.required' => 'Enter the email of the portal account to link.',
            'account_email.email'    => 'Enter a valid email address.',
            'reason.max'             => 'Keep the reason under 500 characters.',
        ];
    }
}
