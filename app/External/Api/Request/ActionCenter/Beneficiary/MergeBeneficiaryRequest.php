<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload validation for the admin "merge this duplicate into a canonical
 * record" action.
 *
 * Pure-shape only — no business rules, no model lookups. The action
 * (MergeBeneficiaryAction) resolves the canonical by beneficiary_number within
 * the tenant and enforces every merge guard.
 *
 * Fields:
 *   • canonical_beneficiary_number → the keep-this-one record's human ID
 *     (e.g. GAS-000123). Resolved case-insensitively, scoped to the tenant.
 *   • was_improper_claim → true when a second payout actually happened on the
 *     duplicate; drives a hard blacklist hold instead of an advisory warning.
 *   • notes → optional free-text added to the audit flag.
 */
class MergeBeneficiaryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'canonical_beneficiary_number' => ['required', 'string', 'max:255'],
            'was_improper_claim'           => ['required', 'boolean'],
            'notes'                        => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'canonical_beneficiary_number.required' => 'Enter the beneficiary number of the record to keep.',
            'notes.max'                             => 'Keep the notes under 1000 characters.',
        ];
    }
}
