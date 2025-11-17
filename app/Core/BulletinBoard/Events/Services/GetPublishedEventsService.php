<?php

namespace App\Core\BulletinBoard\Events\Services;

use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\Core\BulletinBoard\Events\Repositories\EventRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class GetPublishedEventsService
{
    public function __construct(
        private EventRepository $eventRepository,

    ) {
    }

    public function execute(string $municipalId, EventsQueryDto $dto): LengthAwarePaginator
    {

        return $this->eventRepository->getPublished($municipalId, true, $dto);

    }

}