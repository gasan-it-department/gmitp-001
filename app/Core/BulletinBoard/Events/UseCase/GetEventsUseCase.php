<?php

namespace App\Core\BulletinBoard\Events\UseCase;

use App\Core\BulletinBoard\Events\Dto\EventsQueryDto;
use App\Core\BulletinBoard\Events\Repositories\EventRepository;


class GetEventsUseCase
{
    public function __construct(
        protected EventRepository $eventRepository
    ) {

    }

    public function execute(string $municipalId, EventsQueryDto $dto)
    {

        $events = $this->eventRepository->getAllByMunicipalId($municipalId, $dto);

        return $events;
    }
}