<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReviewBeneficiaryIntakeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'household_resolution' => ['required', Rule::in(['keep_existing', 'join_existing'])],
            'target_member_id' => [
                'nullable',
                'ulid',
                'exists:ac_household_members,id',
                'required_if:household_resolution,join_existing',
            ],
            'verified_member_ids' => ['present', 'array'],
            'verified_member_ids.*' => ['ulid', 'distinct', 'exists:ac_household_members,id'],
            'rejected_member_ids' => ['present', 'array'],
            'rejected_member_ids.*' => ['ulid', 'distinct', 'exists:ac_household_members,id'],
        ];
    }
}
