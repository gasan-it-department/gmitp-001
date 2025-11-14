<?php

namespace App\Core\BulletinBoard\Events\Services;

use App\Core\BulletinBoard\Events\Repositories\EventRepository;
use Illuminate\Database\Eloquent\Collection;

class GetEventsService
{
    public function __construct(
        protected EventRepository $eventRepository
    ) {

    }

    public function execute(): Collection
    {
        $municipalId = app('municipal_id');
        $events = $this->eventRepository->getAllByMunicipalId($municipalId);

        return $events;
    }
}