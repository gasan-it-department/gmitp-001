<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Validates the citizen's submission on POST /apply/{assistanceType:slug}.
 *
 * Auto-filled fields (name, sex, birthdate, address) are NOT accepted from the
 * request — they are sourced from the authenticated user's beneficiary record
 * inside the action. This guarantees the verified identity is always used.
 *
 * The citizen does NOT propose an amount. That is set only on approval.
 */
class StoreAssistanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Auth gate is handled by the route middleware. By this point the user
        // is known to be authenticated and within their own municipality context.
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'description' => ['required', 'string', 'min:10', 'max:1000'],
            'privacy_consent' => ['required', 'accepted'],
            // Supporting evidence is accepted only through the admin workflow
            // after MSWD inspects the physical documents.
            'documents' => ['prohibited'],

            // ── Representative ("on behalf of") fields ───────────────────────
            // All optional at the validator level. The action layer is responsible
            // for cross-field rules (e.g. burial REQUIRES a representative + DOD)
            // and for verifying that the chosen household member belongs to the
            // filer's own household.
            'relationship_to_beneficiary' => ['nullable', 'in:spouse,parent,child,sibling'],
            'on_behalf_household_member_id' => ['nullable', 'ulid', 'exists:ac_household_members,id'],
            'on_behalf_first_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_middle_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_last_name' => ['nullable', 'string', 'max:100'],
            'on_behalf_suffix' => ['nullable', 'string', 'max:20'],
            'on_behalf_date_of_death' => ['nullable', 'date', 'before_or_equal:today'],
            'recipient_id_unavailable' => ['nullable', 'boolean'],
            'recipient_id_unavailable_reason' => [
                'nullable',
                'required_if:recipient_id_unavailable,1',
                'string',
                'min:10',
                'max:500',
            ],
        ];

        return $rules;
    }

    public function messages(): array
    {
        return [
            'description.required' => 'Please briefly explain why you are requesting assistance.',
            'description.min' => 'Please give at least a few words about your situation.',
            'privacy_consent.accepted' => 'You must agree to the Data Privacy notice to submit.',
            'documents.prohibited' => 'Supporting documents are recorded by MSWD after the physical originals are inspected.',
            'recipient_id_unavailable_reason.required_if' => 'Explain why the assisted adult cannot provide a government ID.',
            'recipient_id_unavailable_reason.min' => 'Please provide a little more detail about why the assisted adult has no government ID.',
        ];
    }
}
