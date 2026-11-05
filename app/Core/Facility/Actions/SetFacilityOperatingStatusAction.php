<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityOperatingStatusDto;
use App\Core\Facility\Enums\FacilityOperatingStatus;
use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityExceptionWriter;
use App\Core\Facility\Services\FacilityScheduleResolver;
use App\Core\Facility\Services\FacilityScheduleValidator;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class SetFacilityOperatingStatusAction extends FacilityMutationAction
{
    public function __construct(private FacilityScheduleValidator $validator, private FacilityExceptionWriter $writer) {}

    public function execute(string $id, FacilityOperatingStatusDto $dto): Facility
    {
        $resuming = $dto->status === FacilityOperatingStatus::FOLLOWING_SCHEDULE;
        if (! $resuming && trim($dto->notice ?? '') === '') {
            throw ValidationException::withMessages(['operating_notice' => 'A public explanation is required.']);
        }
        if ($dto->todayException && ! $resuming) {
            throw ValidationException::withMessages(['today_exception' => 'Revised hours can only be applied while resuming the schedule.']);
        }

        return $this->mutate($id, $dto, function (Facility $facility) use ($dto, $resuming) {
            if ($dto->todayException) {
                $data = $this->validator->exception($dto->todayException);
                $today = CarbonImmutable::now(FacilityScheduleResolver::TIMEZONE)->toDateString();
                if ($data['exception_date'] !== $today || $data['is_closed'] || ! empty($data['end_date'])) {
                    throw ValidationException::withMessages(['today_exception' => 'Resuming with revised hours requires a single open schedule for today.']);
                }
                $existing = $facility->exceptions()->where('municipal_id', $facility->municipal_id)->where('exception_date', $today)->first();
                $before = $existing?->load('periods')->toArray() ?? [];
                $after = $this->writer->write($facility, $data, $existing);
                $this->audit($facility, 'Revised hours saved while resuming', $before, $after->toArray());
            }
            $facility->fill(['operating_status' => $dto->status, 'operating_notice' => $resuming ? null : trim($dto->notice),
                'expected_reopens_at' => $resuming || $dto->status === FacilityOperatingStatus::PERMANENTLY_CLOSED ? null : $dto->expectedReopensAt]);
        });
    }
}
