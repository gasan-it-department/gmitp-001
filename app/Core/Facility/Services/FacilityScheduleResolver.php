<?php

namespace App\Core\Facility\Services;

use App\Core\Facility\Models\Facility;
use Carbon\CarbonImmutable;

class FacilityScheduleResolver
{
    public const TIMEZONE = 'Asia/Manila';

    /** Resolve one local calendar date. Exceptions replace, rather than supplement, weekly hours. */
    public function forDate(Facility $facility, CarbonImmutable $date): array
    {
        $date = $date->setTimezone(self::TIMEZONE)->startOfDay();
        $exception = $facility->exceptions->first(fn ($exception) => $exception->exception_date->toDateString() === $date->toDateString());
        $day = $exception ?? $facility->weeklyDays->firstWhere('day_of_week', $date->isoWeekday());
        $periods = $day && ! $day->is_closed ? $day->periods->map(fn ($period) => [
            'opening_minute' => $period->opening_minute, 'closing_minute' => $period->closing_minute,
        ])->all() : [];

        return ['periods' => $periods, 'exception' => $exception];
    }

    /** Sorted, merged datetime intervals; adjacent periods represent continuous opening. */
    public function intervals(Facility $facility, CarbonImmutable $date): array
    {
        $date = $date->setTimezone(self::TIMEZONE)->startOfDay();
        $periods = collect($this->forDate($facility, $date)['periods'])->sortBy('opening_minute');
        $merged = [];
        foreach ($periods as $period) {
            $start = $date->addMinutes($period['opening_minute']);
            $end = $date->addMinutes($period['closing_minute']);
            $last = count($merged) - 1;
            if ($last >= 0 && $merged[$last][1]->greaterThanOrEqualTo($start)) {
                $merged[$last][1] = $merged[$last][1]->max($end);
            } else {
                $merged[] = [$start, $end];
            }
        }

        return $merged;
    }
}
