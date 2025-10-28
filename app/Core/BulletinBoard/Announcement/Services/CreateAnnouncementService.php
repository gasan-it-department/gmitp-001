<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;
use App\Core\BulletinBoard\Announcement\Models\Announcement;
use Illuminate\Support\Facades\DB;

class CreateAnnouncementService
{
    public function __construct(
        private AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute(CreateAnnouncementDto $dto): Announcement
    {
        return DB::transaction(function () use ($dto) {
            $announcement = $this->announcementRepository->save($dto);

            return $announcement;
        });

    }
}