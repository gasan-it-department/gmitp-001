<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class DeleteAnnouncementUseCase
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute(string $id)
    {

        $this->announcementRepository->findById($id);

        $this->announcementRepository->delete($id);

    }
}