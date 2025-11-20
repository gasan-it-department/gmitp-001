<?php

namespace App\Core\BulletinBoard\Events\UseCase;

use App\Core\BulletinBoard\Events\Dto\UpdateEventDto;
use App\Core\BulletinBoard\Events\Repositories\EventRepository;

class UpdateEventUseCase
{
    public function __construct(

        protected EventRepository $eventRepo,

    ) {
    }

    public function execute(string $id, UpdateEventDto $dto)
    {

        $this->eventRepo->findById($id);

        return $this->eventRepo->update($id, $dto);

    }
}