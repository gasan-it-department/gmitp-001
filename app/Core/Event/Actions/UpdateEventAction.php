<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Dto\UpdateEventDto;
use App\Core\Event\Models\Event;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateEventAction
{
    public function execute(string $id, UpdateEventDto $dto): Event
    {
        return DB::transaction(function () use ($id, $dto) {
            $event = Event::query()
                ->where('municipal_id', $dto->municipalId)
                ->whereKey($id)
                ->firstOrFail();

            $payload = array_filter([
                'title' => $dto->title,
                'description' => $dto->description,
                'type' => $dto->type,
                'start_datetime' => $dto->startDatetime,
                'is_published' => $dto->isPublished,
            ], fn ($v) => ! is_null($v));

            if ($dto->endDatetimeProvided) {
                $payload['end_datetime'] = $dto->endDatetime;
            }

            if ($dto->locationNameProvided) {
                $payload['location_name'] = $dto->locationName;
            }

            // Guard against partial updates that would invert the time window.
            // The FormRequest's before/after rules only fire when both fields
            // are present in the payload; a lone end_datetime update could
            // otherwise slip past validation.
            $effectiveStart = $dto->startDatetime ?? $event->start_datetime;
            $effectiveEnd = $dto->endDatetimeProvided
                ? $dto->endDatetime
                : $event->end_datetime;

            if ($effectiveStart && $effectiveEnd && $effectiveStart->greaterThanOrEqualTo($effectiveEnd)) {
                throw ValidationException::withMessages([
                    'start_datetime' => 'The start date must be before the end date.',
                    'end_datetime' => 'The end date must be after the start date.',
                ]);
            }

            if (! empty($payload)) {
                $event->update($payload);
            }

            if ($dto->eventBanner instanceof UploadedFile) {
                $event->clearMediaCollection('event_banner');

                $event
                    ->addMedia($dto->eventBanner)
                    ->usingFileName($dto->eventBanner->getClientOriginalName())
                    ->toMediaCollection('event_banner');
            }

            return $event->fresh(['media']);
        }, attempts: 3);
    }
}
