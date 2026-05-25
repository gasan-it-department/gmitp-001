<?php

namespace App\External\Api\Request\ActionCenter;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Payload-shape validation for the citizen "Cancel Assistance Request" endpoint.
 *
 * Ownership and transition rules live in CancelAssistanceRequestAction, not
 * here. This class only validates that, if a reason is provided, it's a
 * reasonable string.
 *
 * `reason` is OPTIONAL — citizens shouldn't be forced to justify withdrawing
 * their own request. When omitted, the action skips the remarks append.
 */
class CancelAssistanceRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        // The action does the ownership check (against beneficiary.user_id)
        // because that needs the loaded model. Authentication is handled by
        // the route's `auth` middleware.
        return true;
    }

    public function rules(): array
    {
        return [
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'reason.max' => 'The cancellation reason must not exceed 500 characters.',
        ];
    }
}
