<?php

namespace App\Core\BulletinBoard\Events\UseCase;

use App\Core\BulletinBoard\Events\Dto\CreateEventDto;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\BulletinBoard\Events\Repositories\EventRepository;

class CreateEventUseCase
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected EventRepository $eventRepository
    ) {
    }
    public function execute(CreateEventDto $dto, $municipalId)
    {

        $eventId = $this->idGenerator->generate();

        return $this->eventRepository->save($dto, $eventId, $municipalId);
    }
}