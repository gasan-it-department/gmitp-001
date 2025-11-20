<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Dto\AnnouncementFilterDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class GetAnnouncementUseCase
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute()
    {
        $municipalId = app('municipal_id');
        return $this->announcementRepository->getAll($municipalId);
    }
}