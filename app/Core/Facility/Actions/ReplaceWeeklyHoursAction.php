<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\WeeklyHoursDto;
use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityScheduleValidator;

class ReplaceWeeklyHoursAction extends FacilityMutationAction
{
    public function __construct(private FacilityScheduleValidator $validator) {}

    public function execute(string $id, WeeklyHoursDto $dto): Facility
    {
        $days = $this->validator->weekly($dto->days);

        return $this->mutate($id, $dto, function (Facility $facility) use ($days) {
            $before = $facility->weeklyDays()->with('periods')->get()->toArray();
            $facility->weeklyDays()->delete();
            foreach ($days as $data) {
                $day = $facility->weeklyDays()->create(['municipal_id' => $facility->municipal_id,
                    'day_of_week' => $data['day_of_week'], 'is_closed' => $data['is_closed']]);
                foreach ($data['periods'] as $period) {
                    $day->periods()->create([...$period, 'municipal_id' => $facility->municipal_id]);
                }
            }
            $this->audit($facility, 'Weekly hours replaced', ['days' => $before], ['days' => $days]);
        });
    }
}
