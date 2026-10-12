<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Models\Household;
use Illuminate\Database\Eloquent\Collection;

final class GetRegistrationHouseholdAction
{
    public function execute(string $municipalId, string $householdId): Household
    {
        $household = Household::query()->where('municipal_id', $municipalId)->with('activeHead')->findOrFail($householdId);
        if ($household->activeMembers()->where('relationship', 'head')->count() !== 1) {
            throw new \DomainException('Confirm the actual household head on the household profile before registering a goods recipient.');
        }

        return $household;
    }

    public function search(string $municipalId, string $search): Collection
    {
        return Household::query()
            ->where('municipal_id', $municipalId)
            ->has('activeMembers', '>=', 1)
            ->whereHas('activeMembers', fn ($query) => $query->where('relationship', 'head'), '=', 1)
            ->when($search !== '', fn ($query) => $query->where(function ($query) use ($search) {
                $pattern = '%'.mb_strtolower($search).'%';
                $query->whereRaw('LOWER(household_code) LIKE ?', [$pattern])
                    ->orWhereRaw('LOWER(barangay) LIKE ?', [$pattern])
                    ->orWhereHas('activeHead', fn ($head) => $head->whereRaw("LOWER(first_name || ' ' || last_name) LIKE ?", [$pattern]));
            }))
            ->with('activeHead')
            ->orderBy('household_code')
            ->limit(20)
            ->get();
    }
}
