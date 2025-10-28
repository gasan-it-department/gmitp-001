<?php

namespace App\Core\BulletinBoard\Events\Repositories;

use App\Core\BulletinBoard\Events\Models\Events;
use App\Core\BulletinBoard\Events\Dto\CreateEventDto;

class EventRepository
{
    public function save(CreateEventDto $dto, string $eventId): void
    {
        Events::create([
            'id' => $eventId,
            'title' => $dto->title,
            'message' => $dto->message,
            'event_date_time' => $dto->eventDateAndTime,
            'user_id' => $dto->userId,
        ]);
    }

}