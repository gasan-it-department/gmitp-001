<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;
use Illuminate\Support\Facades\DB;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class CreateAnnouncementUseCase
{
    public function __construct(
        private AnnouncementRepository $announcementRepository,
        private IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(CreateAnnouncementDto $dto)
    {
        return DB::transaction(function () use ($dto) {

            $announcementId = $this->idGenerator->generate();
            $municipalId = app('municipal_id');

            $announcement = $this->announcementRepository->save($dto, $announcementId, $municipalId);

            return $announcement;
        });

    }
}