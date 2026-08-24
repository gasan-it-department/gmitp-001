<?php

namespace App\Core\Event\Dto;

use App\Core\Event\Enums\EventType;
use App\External\Api\Request\Event\UpdateEventRequest;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

readonly class UpdateEventDto
{
    public function __construct(
        public string $municipalId,
        public ?string $title,
        public ?string $description,
        public ?EventType $type,
        public ?Carbon $startDatetime,
        public ?Carbon $endDatetime,
        public ?string $locationName,
        public ?bool $isPublished,
        public bool $endDatetimeProvided,
        public bool $locationNameProvided,
        public ?UploadedFile $eventBanner = null,
    ) {}

    public static function fromRequest(UpdateEventRequest $request, string $municipalId): self
    {
        return new self(
            municipalId: $municipalId,
            title: $request->filled('title')
                ? $request->string('title')->toString()
                : null,
            description: $request->filled('description')
                ? $request->string('description')->toString()
                : null,
            type: $request->filled('type')
                ? EventType::from(strtolower($request->string('type')->toString()))
                : null,
            startDatetime: $request->filled('start_datetime')
                ? Carbon::parse($request->input('start_datetime'))
                : null,
            endDatetime: $request->filled('end_datetime')
                ? Carbon::parse($request->input('end_datetime'))
                : null,
            locationName: self::nullableTrimmedString($request->input('location_name')),
            isPublished: $request->has('is_published')
                ? $request->boolean('is_published')
                : null,
            endDatetimeProvided: $request->exists('end_datetime'),
            locationNameProvided: $request->exists('location_name'),
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
