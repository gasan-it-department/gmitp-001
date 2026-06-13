<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Support\Collection;

class SearchHouseholdMembershipAction
{
    /** @return Collection<int, array<string, mixed>> */
    public function execute(Beneficiary $beneficiary, string $municipalId, string $search): Collection
    {
        if ($beneficiary->municipal_id !== $municipalId) {
            return collect();
        }

        $term = '%'.mb_strtolower(trim($search)).'%';

        return HouseholdMember::query()
            ->with(['household.activeHead.beneficiary'])
            ->whereHas('household', fn ($query) => $query
                ->where('municipal_id', $municipalId)
                ->whereKeyNot($beneficiary->household_id))
            ->whereHas('household.activeHead.beneficiary', fn ($query) => $query
                ->whereNotNull('identity_verified_at'))
            ->where('is_active', true)
            ->whereNull('beneficiary_id')
            ->where('relationship', '!=', 'head')
            ->where(function ($query) use ($term) {
                $query
                    ->whereRaw('LOWER(first_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', [$term])
                    ->orWhereRaw("LOWER(first_name || ' ' || last_name) LIKE ?", [$term])
                    ->orWhereHas('household', fn ($household) => $household
                        ->whereRaw('LOWER(COALESCE(household_code, \'\')) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(COALESCE(street, \'\')) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(COALESCE(barangay, \'\')) LIKE ?', [$term]))
                    ->orWhereHas('household.activeHead.beneficiary', fn ($head) => $head
                        ->whereRaw('LOWER(first_name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(last_name) LIKE ?', [$term])
                        ->orWhereRaw('LOWER(COALESCE(beneficiary_number, \'\')) LIKE ?', [$term]));
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(20)
            ->get()
            ->map(fn (HouseholdMember $member) => [
                'member_id' => $member->id,
                'household_id' => $member->household_id,
                'household_code' => $member->household?->household_code,
                'barangay' => $member->household?->barangay,
                'street' => $member->household?->street,
                'head_name' => $member->household?->activeHead?->beneficiary?->full_name,
                'member_name' => trim("{$member->first_name} {$member->middle_name} {$member->last_name} {$member->suffix}"),
                'birth_date' => $member->birth_date?->toDateString(),
                'relationship' => $member->relationship,
                'is_exact_match' => $this->matchesBeneficiary($member, $beneficiary),
            ])
            ->values();
    }

    private function matchesBeneficiary(HouseholdMember $member, Beneficiary $beneficiary): bool
    {
        return mb_strtolower(trim($member->first_name)) === mb_strtolower(trim($beneficiary->first_name))
            && mb_strtolower(trim($member->last_name)) === mb_strtolower(trim($beneficiary->last_name))
            && $member->birth_date?->toDateString() === $beneficiary->birth_date?->toDateString();
    }
}
