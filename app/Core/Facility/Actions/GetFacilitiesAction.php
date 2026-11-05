<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityAvailabilityService;
use App\Core\Facility\Services\FacilityScheduleResolver;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetFacilitiesAction
{
    public function __construct(private FacilityAvailabilityService $availability) {}

    public function execute(string $municipalId, array $filters = [], bool $public = false, int $perPage = 12): LengthAwarePaginator
    {
        $now = CarbonImmutable::now(FacilityScheduleResolver::TIMEZONE);
        $facilities = Facility::query()->where('municipal_id', $municipalId)
            ->when($public, fn ($query) => $query->where('is_published', true))
            ->when($filters['search'] ?? null, fn ($query, $search) => $query->where(fn ($query) => $query
                ->whereLike('name', '%'.$search.'%')->orWhereLike('location_name', '%'.$search.'%')))
            ->when($filters['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->when(! $public && ($filters['publication'] ?? null), fn ($query) => $query->where('is_published', $filters['publication'] === 'published'))
            ->with(['media', 'weeklyDays.periods', 'exceptions' => fn ($query) => $query->where('exception_date', '>=', $now->toDateString())->with('periods')])
            ->orderBy('name')->orderBy('id')->paginate(max(1, min($perPage, 50)))->withQueryString();
        $facilities->getCollection()->each(fn (Facility $facility) => $facility->setAttribute('availability', $this->availability->calculate($facility, $now)));

        return $facilities;
    }
}
