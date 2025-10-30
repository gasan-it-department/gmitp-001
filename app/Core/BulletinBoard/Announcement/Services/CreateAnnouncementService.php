<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;
use App\Core\BulletinBoard\Announcement\Models\Announcement;
use Illuminate\Support\Facades\DB;
use App\Shared\Contracts\IdGeneratorInterface;

class CreateAnnouncementService
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

            $announcement = $this->announcementRepository->save($dto, $announcementId);

            return $announcement;
        });

    }
}