<?php

namespace App\Core\Facility\Services;

use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Models\Facility;
use Carbon\CarbonImmutable;

class FacilityAvailabilityService
{
    public function __construct(private FacilityScheduleResolver $resolver) {}

    /** Relations must be eager loaded by the read action. No database queries in this calculation. */
    public function calculate(Facility $facility, ?CarbonImmutable $asOf = null): array
    {
        $now = ($asOf ?? CarbonImmutable::now(FacilityScheduleResolver::TIMEZONE))->setTimezone(FacilityScheduleResolver::TIMEZONE);
        $today = $now->startOfDay();
        $effective = $this->resolver->forDate($facility, $today);
        $exception = $effective['exception'];
        $result = [
            'timezone' => FacilityScheduleResolver::TIMEZONE,
            'date' => $today->toDateString(), 'computed_at' => $now->toAtomString(),
            'next_refresh_at' => $now->addMinute()->min($today->addDay())->toAtomString(),
            'is_open' => false, 'status' => 'closed', 'label' => 'Closed now',
            'closes_at' => null, 'next_opens_at' => null, 'expected_reopens_at' => null,
            'today_periods' => $effective['periods'], 'notice' => $exception?->public_notice,
            'notice_type' => $exception?->notice_type->value,
        ];

        if ($facility->operating_status !== FacilityOperatingStatus::FOLLOWING_SCHEDULE) {
            return array_replace($result, [
                'status' => $facility->operating_status->value, 'label' => $facility->operating_status->label(),
                'notice' => $facility->operating_notice, 'notice_type' => $facility->operating_status->value,
                // Estimates are never used as opening intervals and never clear a hold.
                'expected_reopens_at' => $facility->expected_reopens_at?->setTimezone(FacilityScheduleResolver::TIMEZONE)->toAtomString(),
            ]);
        }
        if ($facility->weeklyDays->count() !== 7) {
            return array_replace($result, ['is_open' => null, 'status' => 'unknown', 'label' => 'Hours unavailable']);
        }

        $intervals = $this->resolver->intervals($facility, $today);
        $current = collect($intervals)->first(fn ($interval) => $interval[0]->lessThanOrEqualTo($now) && $now->lessThan($interval[1]));
        $transition = null;
        if ($current) {
            $transition = $this->continuousClosing($facility, $current[1]);
            $result = array_replace($result, ['is_open' => true, 'status' => 'open', 'label' => 'Open now', 'closes_at' => $transition?->toAtomString()]);
        } else {
            // Beyond the final future exception, an ordinary weekly occurrence is guaranteed
            // within seven days, if one exists. This avoids an arbitrary seven-day cutoff.
            $lastException = $facility->exceptions->max(fn ($item) => $item->exception_date->toDateString());
            $limit = $lastException ? CarbonImmutable::parse($lastException, FacilityScheduleResolver::TIMEZONE)->addDays(7)->max($today->addDays(7)) : $today->addDays(7);
            $weeklyOpens = $facility->weeklyDays->contains(fn ($day) => ! $day->is_closed && $day->periods->isNotEmpty());
            if (! $weeklyOpens) {
                $dates = $facility->exceptions->filter(fn ($item) => ! $item->is_closed && $item->exception_date->toDateString() >= $today->toDateString())
                    ->sortBy('exception_date')->map(fn ($item) => $item->exception_date);
            } else {
                $dates = $today->range($limit);
            }
            foreach ($dates as $date) {
                foreach ($this->resolver->intervals($facility, CarbonImmutable::instance($date)) as [$start, $end]) {
                    if ($start->greaterThan($now)) {
                        $transition = $start;
                        break 2;
                    }
                }
            }
            $result['next_opens_at'] = $transition?->toAtomString();
            if ($exception?->is_closed) {
                $result['status'] = $exception->notice_type->value;
                $result['label'] = $exception->notice_type->value === 'cancelled' ? 'Cancelled today' : 'Closed today';
            } elseif ($exception?->notice_type->value === 'delayed' && $intervals !== [] && $now->lessThan($intervals[0][0])) {
                $result['status'] = 'delayed';
                $result['label'] = 'Delayed';
            }
        }
        if ($transition) {
            $result['next_refresh_at'] = $now->addMinute()->min($transition)->min($today->addDay())->toAtomString();
        }

        return $result;
    }

    private function continuousClosing(Facility $facility, CarbonImmutable $end): ?CarbonImmutable
    {
        $alwaysOpen = $facility->weeklyDays->count() === 7 && $facility->weeklyDays->every(function ($day) {
            // Inspect the weekly periods themselves, independent of date exceptions.
            $periods = $day->periods->sortBy('opening_minute');
            $cursor = 0;
            foreach ($periods as $period) {
                if ($period->opening_minute > $cursor) {
                    return false;
                }
                $cursor = max($cursor, $period->closing_minute);
            }
            return ! $day->is_closed && $cursor === 1440;
        });

        while ($end->equalTo($end->startOfDay())) {
            if ($alwaysOpen) {
                $nextChange = $facility->exceptions->filter(fn ($exception) => $exception->exception_date->toDateString() >= $end->toDateString())
                    ->sortBy('exception_date')->first(function ($exception) use ($facility) {
                        $intervals = $this->resolver->intervals($facility, $exception->exception_date);
                        return count($intervals) !== 1 || ! $intervals[0][0]->equalTo($exception->exception_date->startOfDay())
                            || ! $intervals[0][1]->equalTo($exception->exception_date->startOfDay()->addDay());
                    });
                if (! $nextChange) {
                    return null;
                }
                $end = $nextChange->exception_date->startOfDay();
            }
            $next = $this->resolver->intervals($facility, $end)[0] ?? null;
            if (! $next || ! $next[0]->equalTo($end)) {
                return $end;
            }
            $end = $next[1];
        }

        return $end;
    }
}
