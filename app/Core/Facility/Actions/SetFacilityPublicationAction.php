<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityScheduleValidator;
use Illuminate\Validation\ValidationException;

class SetFacilityPublicationAction extends FacilityMutationAction
{
    public function __construct(private FacilityScheduleValidator $validator) {}

    public function execute(string $id, FacilityMutationDto $dto, bool $published): Facility
    {
        return $this->mutate($id, $dto, function (Facility $facility) use ($published) {
            if ($published) {
                if (! trim($facility->name) || (! $facility->location_name && ! $facility->address)) {
                    throw ValidationException::withMessages(['publication' => 'Add a name and location or address before publishing.']);
                }
                $this->validator->weekly($facility->weeklyDays()->with('periods')->get()->map(fn ($day) => [
                    'day_of_week' => $day->day_of_week, 'is_closed' => $day->is_closed,
                    'periods' => $day->periods->map(fn ($period) => $period->only(['opening_minute', 'closing_minute']))->all(),
                ])->all());
            }
            $facility->is_published = $published;
        });
    }
}
