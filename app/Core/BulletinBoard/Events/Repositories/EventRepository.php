<?php

namespace App\Core\BulletinBoard\Events\Repositories;

use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\Core\BulletinBoard\Events\Models\Events;
use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EventRepository
{
    public function save(CreateEventDto $dto, string $eventId, string $municipalId): void
    {
        Events::create([
            'id' => $eventId,
            'title' => $dto->title,
            'description' => $dto->description,
            'municipal_id' => $municipalId,
            'event_date' => $dto->eventDate,
            'user_id' => $dto->userId,
            'is_published' => $dto->isPublish,
        ]);
    }

    //for admin usage 
    public function getAllByMunicipalId(string $municipalId): Collection
    {
        $events = Events::where('municipal_id', $municipalId)->get();

        return $events;
    }

    public function getPublished(string $municipalId, bool $isPublished, EventsQueryDto $dto): LengthAwarePaginator
    {

        return Events::where('municipal_id', $municipalId)
            ->where('is_published', $isPublished)
            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);

    }
}