<?php

namespace App\Core\BulletinBoard\Events\UseCase;

use App\Core\BulletinBoard\Events\Repositories\EventRepository;

class DeleteEventUseCase
{
    public function __construct(

        protected EventRepository $eventRepo,

    ) {
    }

    public function execute(string $id)
    {

        $this->eventRepo->destroy($id);

    }
}