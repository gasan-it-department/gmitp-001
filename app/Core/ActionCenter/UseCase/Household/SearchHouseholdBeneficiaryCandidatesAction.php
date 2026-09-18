<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\SearchHouseholdBeneficiaryCandidatesDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use Illuminate\Support\Collection;

final class SearchHouseholdBeneficiaryCandidatesAction
{
    /** @return Collection<int, array<string, mixed>> */
    public function execute(SearchHouseholdBeneficiaryCandidatesDto $dto): Collection
    {
        Household::query()
            ->where('municipal_id', $dto->municipalId)
            ->findOrFail($dto->householdId);

        $term = '%'.mb_strtolower($dto->search).'%';

        return Beneficiary::query()
            ->where('municipal_id', $dto->municipalId)
            ->whereNull('merged_into_beneficiary_id')
            ->with([
                'household.activeHead.beneficiary',
                'householdMemberships' => fn ($query) => $query->where('is_active', true),
            ])
            ->where(function ($query) use ($term): void {
                $query
                    ->whereRaw('LOWER(first_name) LIKE ?', [$term])
                    ->orWhereRaw('LOWER(last_name) LIKE ?', [$term])
                    ->orWhereRaw("LOWER(first_name || ' ' || last_name) LIKE ?", [$term])
                    ->orWhereRaw("LOWER(COALESCE(beneficiary_number, '')) LIKE ?", [$term]);
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(20)
            ->get()
            ->map(function (Beneficiary $beneficiary) use ($dto): array {
                $activeMembership = $beneficiary->householdMemberships->first();

                return [
                    'id' => $beneficiary->id,
                    'beneficiary_number' => $beneficiary->beneficiary_number,
                    'full_name' => $beneficiary->full_name,
                    'birth_date' => $beneficiary->birth_date?->toDateString(),
                    'is_active' => (bool) $beneficiary->is_active,
                    'current_household_id' => $beneficiary->household_id,
                    'current_household_code' => $beneficiary->household?->household_code,
                    'current_household_address' => trim(implode(', ', array_filter([
                        $beneficiary->household?->street,
                        $beneficiary->household?->barangay,
                    ]))),
                    'current_head_name' => $beneficiary->household?->activeHead?->beneficiary?->full_name,
                    'current_relationship' => $activeMembership?->relationship,
                    'already_in_destination' => $beneficiary->household_id === $dto->householdId
                        && $activeMembership?->household_id === $dto->householdId,
                ];
            })
            ->values();
    }
}
