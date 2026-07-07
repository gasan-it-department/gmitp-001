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
            'release_date'             => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'release_notes'            => ['nullable', 'string', 'max:1000'],
            'confirm'                  => ['required', 'accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'release_reference_number.required' =>
                'The release reference number is required.',
            'release_reference_number.max' =>
                'The reference number must not exceed 60 characters.',
            'release_date.required' =>
                'The actual release date is required.',
            'release_date.date_format' =>
                'The release date must use the YYYY-MM-DD format.',
            'release_date.before_or_equal' =>
                'The release date cannot be in the future.',
            'release_notes.max' =>
                'Release notes must not exceed 1000 characters.',
            'confirm.accepted' =>
                'Please confirm you understand this release is COA-immutable.',
        ];
    }
}
