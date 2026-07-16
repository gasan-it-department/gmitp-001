<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\HouseholdReassignmentOperation;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class ReassignBeneficiaryHouseholdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // handled by auth/admin middleware
    }

    public function rules(): array
    {
        $isMoveOut = $this->input('operation') === HouseholdReassignmentOperation::MoveOut->value;

        return [
            'operation' => ['required', new Enum(HouseholdReassignmentOperation::class)],
            'reason' => ['required', 'string', 'min:5'],
            
            // Only required for correction/transfer, ignored for move_out
            'destination_household_id' => [
                $isMoveOut ? 'nullable' : 'required_without:new_household_barangay',
                'nullable',
                'ulid',
                Rule::exists('ac_households', 'id')->whereNull('deleted_at'),
            ],
            'destination_member_id' => [
                'nullable',
                'ulid',
                Rule::exists('ac_household_members', 'id')->whereNull('deleted_at'),
            ],
            'new_household_barangay' => [
                $isMoveOut ? 'nullable' : 'required_without:destination_household_id',
                'nullable',
                'string',
            ],
            'new_household_street' => ['nullable', 'string'],
            'verify_at_destination' => ['sometimes', 'boolean'],
            'successor_member_id' => [
                'nullable',
                'ulid',
                Rule::exists('ac_household_members', 'id'),
            ],
            'place_household_on_hold' => ['boolean'],
        ];
    }
}
