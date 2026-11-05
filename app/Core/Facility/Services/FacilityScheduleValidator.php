<?php

namespace App\Core\Facility\Services;

use App\Core\Facility\Enums\FacilityNoticeType;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class FacilityScheduleValidator
{
    public function weekly(array $days): array
    {
        $data = Validator::make(['days' => $days], [
            'days' => ['required', 'array', 'size:7'],
            'days.*' => ['array:day_of_week,is_closed,periods'],
            'days.*.day_of_week' => ['required', 'integer', 'between:1,7', 'distinct'],
            'days.*.is_closed' => ['required', 'boolean'],
            'days.*.periods' => ['present', 'array', 'max:12'],
            ...$this->periodRules('days.*.periods'),
        ])->validate();

        return collect($data['days'])->map(fn (array $day, int $index) => [
            'day_of_week' => (int) $day['day_of_week'],
            'is_closed' => (bool) $day['is_closed'],
            'periods' => $this->periods($day['periods'], (bool) $day['is_closed'], "days.{$index}.periods"),
        ])->sortBy('day_of_week')->values()->all();
    }

    public function exception(array $data): array
    {
        $data = Validator::make($data, [
            'exception_date' => ['required', 'date_format:Y-m-d'],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:exception_date'],
            'notice_type' => ['required', Rule::enum(FacilityNoticeType::class)],
            'is_closed' => ['required', 'boolean'],
            'public_notice' => ['required', 'string', 'max:2000'],
            'periods' => ['present', 'array', 'max:12'],
            ...$this->periodRules('periods'),
        ])->validate();
        $type = FacilityNoticeType::from($data['notice_type']);
        if ($type->closesDay() !== (bool) $data['is_closed']) {
            throw ValidationException::withMessages(['is_closed' => 'Closed/cancelled dates must be closed; special hours and confirmed delays need opening periods.']);
        }
        $data['is_closed'] = (bool) $data['is_closed'];
        $data['public_notice'] = trim($data['public_notice']);
        if ($data['public_notice'] === '') {
            throw ValidationException::withMessages(['public_notice' => 'Please explain the schedule change.']);
        }
        $data['periods'] = $this->periods($data['periods'], $data['is_closed'], 'periods');

        return $data;
    }

    private function periodRules(string $prefix): array
    {
        return [
            "{$prefix}.*" => ['array:opening_minute,closing_minute'],
            "{$prefix}.*.opening_minute" => ['required', 'integer', 'between:0,1439'],
            "{$prefix}.*.closing_minute" => ['required', 'integer', 'between:1,1440'],
        ];
    }

    private function periods(array $periods, bool $closed, string $key): array
    {
        if (($closed && count($periods) !== 0) || (! $closed && count($periods) === 0)) {
            throw ValidationException::withMessages([$key => $closed ? 'Closed days cannot contain opening periods.' : 'Add at least one opening period.']);
        }
        $periods = collect($periods)->map(fn (array $period) => [
            'opening_minute' => (int) $period['opening_minute'], 'closing_minute' => (int) $period['closing_minute'],
        ])->sortBy('opening_minute')->values()->all();
        $previousEnd = -1;
        foreach ($periods as $period) {
            if ($period['opening_minute'] >= $period['closing_minute'] || $period['opening_minute'] < $previousEnd) {
                throw ValidationException::withMessages([$key => 'Periods must end after opening and cannot overlap. Split overnight hours across two days.']);
            }
            $previousEnd = $period['closing_minute'];
        }

        return $periods;
    }
}
