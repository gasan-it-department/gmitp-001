<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class DeleteAnnouncementService
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute()
    {

    }
}