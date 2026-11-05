<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityExceptionDto;
use App\Core\Facility\Models\Facility;
use App\Core\Facility\Services\FacilityExceptionWriter;
use App\Core\Facility\Services\FacilityScheduleResolver;
use App\Core\Facility\Services\FacilityScheduleValidator;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class SaveFacilityExceptionAction extends FacilityMutationAction
{
    public function __construct(private FacilityScheduleValidator $validator, private FacilityExceptionWriter $writer) {}

    public function execute(string $id, FacilityExceptionDto $dto, ?string $exceptionId = null): Facility
    {
        $data = $this->validator->exception($dto->data);
        $start = CarbonImmutable::parse($data['exception_date'], FacilityScheduleResolver::TIMEZONE);
        $end = CarbonImmutable::parse($data['end_date'] ?? $data['exception_date'], FacilityScheduleResolver::TIMEZONE);
        if ($start->diffInDays($end) > 365 || ($exceptionId && ! $start->equalTo($end))) {
            throw ValidationException::withMessages(['end_date' => 'Use at most 366 dates when adding, and a single date when editing.']);
        }

        return $this->mutate($id, $dto, function (Facility $facility) use ($data, $start, $end, $exceptionId) {
            $exception = $exceptionId ? $facility->exceptions()->where('municipal_id', $facility->municipal_id)->whereKey($exceptionId)->firstOrFail() : null;
            $conflicts = $facility->exceptions()->where('municipal_id', $facility->municipal_id)
                ->whereBetween('exception_date', [$start->toDateString(), $end->toDateString()])
                ->when($exceptionId, fn ($query) => $query->where('id', '!=', $exceptionId))->pluck('exception_date');
            if ($conflicts->isNotEmpty()) {
                throw ValidationException::withMessages(['exception_date' => 'An exception already exists for: '.$conflicts->map(fn ($date) => CarbonImmutable::parse($date)->toDateString())->join(', ').'. Edit it explicitly.']);
            }
            $before = $exception?->load('periods')->toArray() ?? [];
            $after = [];
            foreach ($start->range($end) as $date) {
                $after[] = $this->writer->write($facility, [...$data, 'exception_date' => $date->toDateString()], $exception)->toArray();
            }
            $this->audit($facility, $exceptionId ? 'Schedule exception updated' : 'Schedule exception added', $before, ['exceptions' => $after]);
        });
    }
}
