<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload validation for the admin "Approve Assistance Request" action.
 *
 * Intentionally only validates SHAPE — not business rules. The action layer
 * (ApproveAssistanceRequestAction) re-validates against the AssistanceType's
 * min/max amount, the request's status, document requirements, etc. Keeping
 * FormRequest pure-shape means we don't need to query the model here.
 *
 * Required fields:
 *   • amount_approved → the amount the approver is committing to (in pesos)
 *   • approval_notes  → COA-meaningful basis for the approval. Required
 *     because COA audits expect a written rationale for every disbursement.
 *     Minimum length forces something more substantial than "OK" / "approved".
 *   • confirm         → forces an explicit "I understand this is irreversible"
 *     checkbox click on the frontend. Defensive against accidental clicks
 *     since approval triggers cooldown writes that block future requests.
 */
class ApproveAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // Amount the approver is committing the LGU to disburse. Bounds
            // against the AssistanceType's min/max are re-checked inside the
            // action (where the type is already loaded) — keeping the type
            // lookup out of this FormRequest preserves the pure-shape rule.
            'amount_approved' => ['required', 'numeric', 'gt:0', 'max:99999999.99'],

            // Basis of approval — COA evidence. The action appends this to
            // the request's existing remarks rather than replacing them, so
            // the full case-study history is preserved.
            'approval_notes'  => ['required', 'string', 'min:10', 'max:2000'],

            // Explicit "I understand this is COA-immutable once released"
            // checkbox. Prevents accidental approval clicks.
            'confirm'         => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'amount_approved.required' => 'An approved amount is required.',
            'amount_approved.gt'       => 'The approved amount must be greater than 0.',
            'approval_notes.required'  => 'A short note explaining the basis of approval is required for COA records.',
            'approval_notes.min'       => 'The approval notes must be at least 10 characters (e.g. "Approved per Mayor E.O. 2026-04").',
            'confirm.accepted'         => 'Please confirm you understand this approval is COA-immutable.',
        ];
    }
}
