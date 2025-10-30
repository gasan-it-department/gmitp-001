<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Dto\AnnouncementFilterDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class GetAnnouncementService
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute(AnnouncementFilterDto $dto)
    {
        return $this->announcementRepository->getFiltered($dto);
    }
}