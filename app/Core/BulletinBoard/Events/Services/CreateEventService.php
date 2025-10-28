<?php

namespace App\Core\BulletinBoard\Events\Services;

use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use App\Shared\Contracts\IdGeneratorInterface;
use App\Core\BulletinBoard\Events\Repositories\EventRepository;

class CreateEventService
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected EventRepository $eventRepository
    ) {
    }
    public function execute(CreateEventDto $dto)
    {
        $eventId = $this->idGenerator->generate();

        $this->eventRepository->save($dto, $eventId);
    }
}