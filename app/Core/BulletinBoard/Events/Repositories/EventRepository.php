<?php

namespace App\Core\BulletinBoard\Events\Repositories;

use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\Core\BulletinBoard\Events\Dto\UpdateEventDto;
use App\Core\BulletinBoard\Events\Models\Events;
use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class EventRepository
{
    public function save(CreateEventDto $dto, string $eventId, string $municipalId): Events
    {
        return Events::create([
            'id' => $eventId,
            'title' => $dto->title,
            'description' => $dto->description,
            'municipal_id' => $municipalId,
            'event_date' => $dto->eventDate,
            'user_id' => $dto->userId,
            'is_published' => $dto->isPublish,
        ]);
    }

    public function findById(string $id): Events
    {

        return Events::findOrFail($id);

    }

    //for admin usage 
    public function getAllByMunicipalId(string $municipalId, EventsQueryDto $dto): LengthAwarePaginator
    {
        $query = Events::query()
            ->where('municipal_id', $municipalId)
            ->where('is_published', $dto->isPublished)
            ->with('user')
            ->when(!empty($dto->search), function ($query) use ($dto) {

                $searchTerm = '%' . $dto->search . '%';

                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm);
                });

            });

        return $query->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);
    }

    public function getPublished(string $municipalId, bool $isPublished, EventsQueryDto $dto): LengthAwarePaginator
    {
        $query = Events::query()
            ->where('municipal_id', $municipalId)
            ->where('is_published', $isPublished)
            ->with('user')
            ->when(!empty($dto->search), function ($query) use ($dto) {

                $searchTerm = '%' . $dto->search . '%';

                $query->where(function ($q) use ($searchTerm) {
                    $q->where('title', 'like', $searchTerm)
                        ->orWhere('description', 'like', $searchTerm);
                });

            });


        return $query->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);
    }


    public function destroy(array $ids)
    {

        return Events::destroy($ids);

    }


    public function update(string $id, UpdateEventDto $dto)
    {
        $event = Events::findOrFail($id);

        $updates = [];

        if (!is_null($dto->title)) {
            $updates['title'] = $dto->title;
        }

        if (!is_null($dto->description)) {
            $updates['description'] = $dto->description;
        }

        if (!is_null($dto->eventDate)) {
            $updates['event_date'] = $dto->eventDate;
        }

        if (!empty($updates)) {
            $event->update($updates);
        }

        return $event;
    }
}