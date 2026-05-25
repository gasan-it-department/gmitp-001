<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload-shape validation for the "Mark as Released" endpoint.
 *
 * Business rules (transition allowed, ref-number uniqueness within
 * municipality, amount-approved non-null) live in the action, not here.
 * This class only checks that the payload is well-formed.
 *
 * `confirm` mirrors the approve dialog — release is also COA-immutable and
 * deserves an explicit acknowledgement before the cashier commits.
 */
class ReleaseAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'release_reference_number' => ['required', 'string', 'max:60'],
            'release_notes'            => ['nullable', 'string', 'max:1000'],
            'confirm'                  => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'release_reference_number.required' =>
                'The OR / voucher number from the cashier book is required.',
            'release_reference_number.max' =>
                'The reference number must not exceed 60 characters.',
            'release_notes.max' =>
                'Release notes must not exceed 1000 characters.',
            'confirm.accepted' =>
                'Please confirm you understand this release is COA-immutable.',
        ];
    }
}
