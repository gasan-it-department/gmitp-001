<?php

namespace App\Core\Event\Actions;

use App\Core\Event\Dto\StoreEventDto;
use App\Core\Event\Models\Event;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class StoreEventAction
{
    public function __construct(
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(StoreEventDto $dto): Event
    {
        return DB::transaction(function () use ($dto) {
            $event = Event::create([
                'id'             => $this->idGenerator->generate(),
                'municipal_id'   => $dto->municipalId,
                'title'          => $dto->title,
                'description'    => $dto->description,
                'type'           => $dto->type,
                'start_datetime' => $dto->startDatetime,
                'end_datetime'   => $dto->endDatetime,
                'location_name'  => $dto->locationName,
                'is_published'   => $dto->isPublished,
            ]);

            if ($dto->eventBanner instanceof UploadedFile) {
                $event
                    ->addMedia($dto->eventBanner)
                    ->usingFileName($dto->eventBanner->getClientOriginalName())
                    ->toMediaCollection('event_banner');
            }

            return $event->fresh(['media']);
        }, attempts: 3);
    }
}
