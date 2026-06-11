<?php

namespace App\External\Api\Request\ActionCenter;

use App\Core\ActionCenter\Models\AssistanceType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

/**
 * Validates an ADMIN-encoded assistance request (the walk-in counter, or filing
 * on behalf of an online beneficiary who cannot use the portal).
 *
 * Sibling of {@see StoreAssistanceRequest} (the citizen self-file form). Two
 * structural differences:
 *
 *   1. `beneficiary_id` and `assistance_type_id` are submitted fields — there is
 *      no authenticated citizen to resolve the beneficiary from, and the program
 *      is chosen in a dropdown rather than bound from the URL slug.
 *   2. Documents are OPTIONAL. The admin verifies physical originals at the desk
 *      and may attach scans later; the per-document slots are still validated for
 *      type/size IF a file is provided, but never required.
 *
 * Identity / address / income are NEVER accepted here — the action snapshots
 * them from the resolved beneficiary record (the verified identity).
 */
class StoreAdminAssistanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Route middleware (admin + permission:action_center.access) already
        // gated this. Tenant ownership of the beneficiary is enforced in the
        // action, against the resolved municipality.
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'beneficiary_id' => ['required', 'ulid', 'exists:ac_beneficiaries,id'],
            'assistance_type_id' => ['required', 'ulid', 'exists:ac_assistance_types,id'],

            'description' => ['required', 'string', 'min:10', 'max:1000'],

            // Admin affirmation that on-behalf RA 10173 consent was obtained.
            'privacy_consent' => ['required', 'accepted'],
            'verification_override_reason' => ['nullable', 'string', 'min:10', 'max:500'],

            // Optional for the admin path — see class docblock.
            'documents' => ['nullable', 'array'],

            // ── Representative ("on behalf of") fields ───────────────────────
            'relationship_to_beneficiary' => ['nullable', 'in:spouse,parent,child,sibling'],
            'on_behalf_household_member_id' => ['nullable', 'ulid', 'exists:ac_household_members,id'],
            'on_behalf_first_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_middle_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_last_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_suffix' => ['nullable', 'string', 'max:20'],
            'on_behalf_date_of_death' => ['nullable', 'date', 'before_or_equal:today'],
        ];

        // Per-document slot rules for the SELECTED assistance type — resolved
        // from the submitted id (not a route binding). Each slot is nullable
        // (optional) but, when a file is sent, must be a valid type/size.
        $assistanceType = AssistanceType::find($this->input('assistance_type_id'));

        if ($assistanceType instanceof AssistanceType) {
            $requirements = DB::table('ac_assistance_type_documents as atd')
                ->join('ac_document_types as dt', 'dt.id', '=', 'atd.document_type_id')
                ->where('atd.assistance_type_id', $assistanceType->id)
                ->orderBy('atd.sort_order')
                ->get(['dt.key']);

            foreach ($requirements as $req) {
                $rules["documents.{$req->key}"] = [
                    'nullable',
                    'file',
                    'mimes:jpg,jpeg,png,pdf',
                    'max:5120', // 5 MB
                ];
            }
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'beneficiary_id.required' => 'Select the beneficiary this request is for.',
            'assistance_type_id.required' => 'Choose the type of assistance.',
            'description.required' => 'Briefly explain why this person is requesting assistance.',
            'description.min' => 'Please give at least a few words about the situation.',
            'privacy_consent.accepted' => 'Confirm the applicant consented (RA 10173) before submitting.',
            'documents.*.mimes' => 'Allowed file types: JPG, PNG, PDF.',
            'documents.*.max' => 'Each file must be 5 MB or smaller.',
        ];
    }
}
