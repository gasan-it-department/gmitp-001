<?php

namespace App\External\Api\Resources\ActionCenter;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Enums\Sex;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryListResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Discriminated payload for the interview search. Beneficiary results retain
 * their existing search-card data; roster-only results expose household
 * context without pretending the inline person is an official beneficiary.
 */
class PeopleSearchResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return $this->resource['record_type'] === 'beneficiary'
            ? $this->beneficiaryResult($request, $this->resource['record'])
            : $this->rosterResult($this->resource['record']);
    }

    private function beneficiaryResult(Request $request, Beneficiary $beneficiary): array
    {
        $memberships = $beneficiary->householdMemberships
            ->map(fn (HouseholdMember $member) => $this->membership($member, $beneficiary))
            ->sortBy(fn (array $membership) => match ($membership['status']) {
                'current_household' => 0,
                'other_active_household' => 1,
                default => 2,
            })
            ->values();

        $activeMemberships = $memberships->where('is_active', true);
        $hasCurrentMembership = $activeMemberships->contains(
            fn (array $membership) => $membership['status'] === 'current_household',
        );
        $missingCurrentMembership = $beneficiary->is_active && ! $hasCurrentMembership;
        $multipleActiveMemberships = $activeMemberships->count() > 1;

        return [
            'record_type' => 'beneficiary',
            ...(new BeneficiaryListResource($beneficiary))->toArray($request),
            'account_phone' => $beneficiary->user?->phone,
            'household_code' => $beneficiary->household?->household_code,
            'memberships' => $memberships->all(),
            'membership_warning' => [
                'has_warning' => $missingCurrentMembership || $multipleActiveMemberships,
                'missing_current_membership' => $missingCurrentMembership,
                'multiple_active_memberships' => $multipleActiveMemberships,
            ],
        ];
    }

    private function rosterResult(HouseholdMember $member): array
    {
        $household = $member->household;
        $head = $household?->activeHead;
        $headBeneficiary = $head?->beneficiary;

        return [
            'record_type' => 'roster_only',
            'id' => $member->id,
            'member_id' => $member->id,
            'full_name' => $this->memberName($member),
            'first_name' => $member->first_name,
            'middle_name' => $member->middle_name,
            'last_name' => $member->last_name,
            'suffix' => $member->suffix,
            'birth_date' => $member->birth_date?->toDateString(),
            'age' => $member->birth_date?->age,
            'sex' => $member->sex,
            'sex_label' => $member->sex ? Sex::tryFrom($member->sex)?->label() : null,
            'relationship' => $member->relationship,
            'relationship_label' => Relationship::tryFrom($member->relationship)?->label(),
            'is_active' => (bool) $member->is_active,
            'is_verified_dependent' => (bool) $member->is_verified_dependent,
            'verification_status' => $member->is_verified_dependent ? 'verified' : 'pending',
            'household' => [
                'id' => $household?->id,
                'household_code' => $household?->household_code,
                'barangay' => $household?->barangay,
                'street' => $household?->street,
                'head_name' => $head ? ($headBeneficiary?->full_name ?? $this->memberName($head)) : null,
                'head_beneficiary_id' => $head?->beneficiary_id,
                'is_on_hold' => $head === null,
            ],
        ];
    }

    private function membership(HouseholdMember $member, Beneficiary $beneficiary): array
    {
        $status = ! $member->is_active
            ? 'moved_out'
            : ($member->household_id === $beneficiary->household_id
                ? 'current_household'
                : 'other_active_household');
        $head = $member->household?->activeHead;

        return [
            'id' => $member->id,
            'household_id' => $member->household_id,
            'household_code' => $member->household?->household_code,
            'barangay' => $member->household?->barangay,
            'street' => $member->household?->street,
            'relationship' => $member->relationship,
            'relationship_label' => Relationship::tryFrom($member->relationship)?->label(),
            'is_active' => (bool) $member->is_active,
            'is_verified_dependent' => (bool) $member->is_verified_dependent,
            'status' => $status,
            'head_name' => $head?->beneficiary?->full_name ?? ($head ? $this->memberName($head) : null),
            'head_beneficiary_id' => $head?->beneficiary_id,
        ];
    }

    private function memberName(HouseholdMember $member): string
    {
        return trim(implode(' ', array_filter([
            $member->first_name,
            $member->middle_name,
            $member->last_name,
            $member->suffix,
        ])));
    }
}
