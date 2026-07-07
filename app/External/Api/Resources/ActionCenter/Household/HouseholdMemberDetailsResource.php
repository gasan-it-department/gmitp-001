<?php

// app/External/Api/Resources/ActionCenter/Household/HouseholdMemberDetailsResource.php

namespace App\External\Api\Resources\ActionCenter\Household;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Single household member as shown on the admin detail page's Household
 * Composition card. Shape MUST stay in sync with the React
 * `HouseholdMemberBlock` interface in AssistanceRequestsDetails.tsx.
 *
 * `age` is computed from birth_date at serialize time so the React side
 * doesn't have to redo the date math (and it stays accurate as the
 * page is reloaded — no stale "32" lingering past a birthday).
 */
class HouseholdMemberDetailsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $linkedBeneficiary = $this->relationLoaded('beneficiary')
            ? $this->beneficiary
            : null;
        $linkedPrimaryHouseholdId = $linkedBeneficiary?->household_id;
        $isLinkedToPrimaryHousehold = $linkedBeneficiary
            ? $linkedPrimaryHouseholdId === $this->household_id
            : null;

        return [
            'id' => $this->id,
            'household_id' => $this->household_id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'middle_name' => $this->middle_name,
            'suffix' => $this->suffix,
            'relationship' => $this->relationship,
            'birth_date' => $this->birth_date?->toDateString(),
            'age' => $this->birth_date?->age,
            'sex' => $this->sex,
            'civil_status' => $this->civil_status?->value,
            'educational_attainment' => $this->educational_attainment?->value,
            'occupation' => $this->occupation,
            'monthly_income' => (float) $this->monthly_income,
            'religion_id' => $this->religion_id,
            // Admin roster management (profile page): is this person the
            // server-managed head (mirrors the beneficiary), and are they
            // currently living in the household?
            'beneficiary_id' => $this->beneficiary_id,
            'beneficiary_number' => $linkedBeneficiary?->beneficiary_number,
            'beneficiary_full_name' => $linkedBeneficiary?->full_name,
            'beneficiary_has_portal_account' => $linkedBeneficiary
                ? $linkedBeneficiary->user_id !== null
                : null,
            'linked_beneficiary_primary_household_id' => $linkedPrimaryHouseholdId,
            'linked_beneficiary_primary_household_code' => $linkedBeneficiary?->household?->household_code,
            'is_linked_to_primary_household' => $isLinkedToPrimaryHousehold,
            'is_active' => (bool) $this->is_active,
            'is_verified_dependent' => (bool) $this->is_verified_dependent,
        ];
    }
}
