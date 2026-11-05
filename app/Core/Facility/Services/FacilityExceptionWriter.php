<?php

namespace App\Core\Facility\Services;

use App\Core\Facility\Models\Facility;
use App\Core\Facility\Models\FacilityScheduleException;
use Illuminate\Support\Arr;

class FacilityExceptionWriter
{
    /** Called inside a facility action's transaction and revision lock. */
    public function write(Facility $facility, array $data, ?FacilityScheduleException $exception = null): FacilityScheduleException
    {
        $attributes = Arr::only($data, ['exception_date', 'is_closed', 'notice_type', 'public_notice']);
        if ($exception) {
            $exception->update($attributes);
            $exception->periods()->delete();
        } else {
            $exception = $facility->exceptions()->create([...$attributes, 'municipal_id' => $facility->municipal_id]);
        }
        foreach ($data['periods'] as $period) {
            $exception->periods()->create([...$period, 'municipal_id' => $facility->municipal_id]);
        }

        return $exception->load('periods');
    }
}
