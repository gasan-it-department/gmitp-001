<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;

final class GoodsRecipientIdentityService
{
    public function __construct(private readonly ResolveBeneficiaryIdentityGroupAction $groups) {}

    public function resolve(string $municipalId, string $kind, string $id): array
    {
        $beneficiaryIds = [];
        $memberIds = [];
        $redirectId = null;
        if ($kind === 'member') {
            $person = HouseholdMember::withTrashed()->whereHas('household', fn ($q) => $q->withTrashed()->where('municipal_id', $municipalId))
                ->whereKey($id)->firstOrFail();
            if ($person->beneficiary_id) {
                $linked = $this->resolve($municipalId, 'beneficiary', $person->beneficiary_id);

                return [...$linked, 'redirect_beneficiary_id' => $linked['profile']['id']];
            }
            $memberIds = [$person->id];
        } else {
            $person = Beneficiary::withTrashed()->where('municipal_id', $municipalId)->whereKey($id)->firstOrFail();
            if ($person->merged_into_beneficiary_id) {
                $person = Beneficiary::withTrashed()->where('municipal_id', $municipalId)->whereKey($person->merged_into_beneficiary_id)->firstOrFail();
                $redirectId = $person->id;
            }
            $group = $this->groups->execute($person);
            // Archived duplicates remain valid historical identities; never accept a foreign tenant's group member.
            $beneficiaryIds = Beneficiary::withTrashed()->where('municipal_id', $municipalId)
                ->where(fn ($q) => $q->whereIn('id', $group->beneficiaryIds)->orWhere('merged_into_beneficiary_id', $person->id))
                ->pluck('id')->all();
            $memberIds = HouseholdMember::withTrashed()->whereIn('beneficiary_id', $beneficiaryIds)
                ->whereHas('household', fn ($q) => $q->withTrashed()->where('municipal_id', $municipalId))->pluck('id')->all();
        }
        $household = Household::withTrashed()->where('municipal_id', $municipalId)->whereKey($person->household_id)
            ->with('activeHead')->first();
        $membership = $kind === 'beneficiary' ? HouseholdMember::query()->where('beneficiary_id', $person->id)->where('is_active', true)->get() : collect();
        $validMembership = $kind === 'beneficiary' && $membership->count() === 1
            && $membership->first()->household_id === $household?->id && $household?->deleted_at === null && $household !== null;

        return [
            'beneficiary_ids' => $beneficiaryIds, 'member_ids' => $memberIds, 'redirect_beneficiary_id' => $redirectId,
            'household_id' => $person->is_active && ! $person->trashed() && $household && ! $household->trashed()
                && ($kind === 'member' || $validMembership) ? $household->id : null,
            'can_create' => $kind === 'beneficiary' && $person->is_active && ! $person->trashed() && $validMembership,
            'profile' => [
                'id' => $person->id, 'kind' => $kind, 'name' => $this->name($person),
                'beneficiary_number' => $kind === 'beneficiary' ? $person->beneficiary_number : null,
                'birth_date' => $person->birth_date?->toDateString(), 'is_active' => $person->is_active && ! $person->trashed(),
                'archived' => $person->trashed(), 'identity_verified' => $kind === 'beneficiary' ? $person->identity_verified_at !== null : null,
                'household' => $household ? ['code' => $household->household_code, 'head_name' => $household->activeHead ? $this->name($household->activeHead) : null,
                    'barangay' => $household->barangay, 'is_current' => ! $household->trashed() && ! $person->trashed()
                        && ($kind === 'member' ? $person->is_active : $validMembership)] : null,
            ],
        ];
    }

    private function name(Beneficiary|HouseholdMember $person): string
    {
        return trim(implode(' ', array_filter([$person->first_name, $person->middle_name, $person->last_name, $person->suffix])));
    }
}
