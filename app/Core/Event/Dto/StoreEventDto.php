<?php

namespace App\Core\Event\Dto;

use App\Core\Event\Enums\EventType;
use App\External\Api\Request\Event\StoreEventRequest;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

readonly class StoreEventDto
{
    public function __construct(
        public string $municipalId,
        public string $title,
        public string $description,
        public EventType $type,
        public Carbon $startDatetime,
        public ?Carbon $endDatetime,
        public ?string $locationName,
        public bool $isPublished,
        public ?UploadedFile $eventBanner = null,
    ) {}

    public static function fromRequest(StoreEventRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            title: $request->string('title')->toString(),
            description: $request->string('description')->toString(),
            type: EventType::from(strtolower($request->string('type')->toString())),
            startDatetime: Carbon::parse($request->input('start_datetime')),
            endDatetime: $request->filled('end_datetime')
                ? Carbon::parse($request->input('end_datetime'))
                : null,
            locationName: self::nullableTrimmedString($request->input('location_name')),
            isPublished: $request->boolean('is_published'),
            eventBanner: $request->file('event_banner'),
        );
    }

    private static function nullableTrimmedString(mixed $value): ?string
    {
        if (! is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value === '' ? null : $value;
    }
}
