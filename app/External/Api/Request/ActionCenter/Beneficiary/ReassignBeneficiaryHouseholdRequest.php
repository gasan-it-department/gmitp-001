<?php

namespace App\External\Api\Request\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Enums\HouseholdReassignmentOperation;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\Users\Enums\EnumPermissions;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class ReassignBeneficiaryHouseholdRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->user()?->can(EnumPermissions::ACTION_CENTER_BENEFICIARIES_VERIFY->value)) {
            $this->merge(['verify_at_destination' => false]);
        }
    }

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
            'destination_relationship' => [
                Rule::requiredIf(fn (): bool => ! $isMoveOut
                    && filled($this->input('destination_household_id'))
                    && blank($this->input('destination_member_id'))),
                'nullable',
                Rule::in(collect(Relationship::cases())
                    ->reject(fn (Relationship $relationship): bool => $relationship === Relationship::Head)
                    ->map(fn (Relationship $relationship): string => $relationship->value)
                    ->all()),
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
