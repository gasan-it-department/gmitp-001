<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class DeleteAnnouncementUseCase
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute()
    {

    }
}