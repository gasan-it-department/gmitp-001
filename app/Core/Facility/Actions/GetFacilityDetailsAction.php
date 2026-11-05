<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityAvailabilityService;
use App\Core\Facility\Services\FacilityScheduleResolver;
use Carbon\CarbonImmutable;

class GetFacilityDetailsAction
{
    public function __construct(private FacilityAvailabilityService $availability) {}

    public function execute(string $municipalId, string $id, bool $public = false): Facility
    {
        $facility = Facility::query()->where('municipal_id', $municipalId)->whereKey($id)
            ->when($public, fn ($query) => $query->where('is_published', true))
            ->with(['media', 'weeklyDays.periods', 'exceptions' => fn ($query) => $query
                ->when($public, fn ($query) => $query->where('exception_date', '>=', CarbonImmutable::now(FacilityScheduleResolver::TIMEZONE)->toDateString()))
                ->with('periods')])->firstOrFail();
        if (! $public) {
            $facility->load(['activities' => fn ($query) => $query->latest()->limit(30)]);
        }
        $facility->setAttribute('availability', $this->availability->calculate($facility));

        return $facility;
    }
}
