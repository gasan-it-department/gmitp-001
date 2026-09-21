<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Payload-shape validation for the physical-handover endpoint.
 *
 * Business rules (transition allowed, ref-number uniqueness within
 * municipality, amount-approved non-null) live in the action, not here.
 * This class only checks that the payload is well-formed.
 *
 * `confirm` mirrors the approve dialog: release is COA-immutable and deserves
 * an explicit acknowledgement before the authorized releasing user commits.
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
            'disbursement_id' => ['required', 'ulid'],
            'release_reference_number' => ['required', 'string', 'max:60'],
            'release_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'receiver_type' => ['required', Rule::in(['claimant', 'representative'])],
            'receiver_name' => ['required_if:receiver_type,representative', 'nullable', 'string', 'max:255'],
            'receiver_relationship' => ['required_if:receiver_type,representative', 'nullable', 'string', 'max:100'],
            'receiver_id_type' => ['required_if:receiver_type,representative', 'nullable', 'string', 'max:100'],
            'receiver_id_last_four' => ['required_if:receiver_type,representative', 'nullable', 'alpha_num', 'size:4'],
            'identity_confirmed' => ['required', 'accepted'],
            'acknowledgement_signed' => ['required', 'accepted'],
            'release_notes' => ['nullable', 'string', 'max:1000'],
            'confirm' => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'release_reference_number.required' => 'The release reference number is required.',
            'release_reference_number.max' => 'The reference number must not exceed 60 characters.',
            'release_date.required' => 'The actual release date is required.',
            'release_date.date_format' => 'The release date must use the YYYY-MM-DD format.',
            'release_date.before_or_equal' => 'The release date cannot be in the future.',
            'release_notes.max' => 'Release notes must not exceed 1000 characters.',
            'receiver_name.required_if' => 'Enter the authorized representative\'s full name.',
            'receiver_relationship.required_if' => 'Enter the representative\'s relationship to the claimant.',
            'receiver_id_type.required_if' => 'Enter the type of ID inspected for the representative.',
            'receiver_id_last_four.required_if' => 'Enter the last four characters of the representative\'s inspected ID.',
            'identity_confirmed.accepted' => 'Confirm that the receiver\'s identity was inspected.',
            'acknowledgement_signed.accepted' => 'Confirm that the acknowledgement receipt was signed.',
            'confirm.accepted' => 'Please confirm you understand this release is COA-immutable.',
        ];
    }
}
