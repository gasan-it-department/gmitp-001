<?php

namespace App\Core\BulletinBoard\Announcement\Services;

use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;
class PublishAnnouncementService
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute(string $id)
    {
        $announcement = $this->announcementRepository->findById($id);

        if ($announcement->is_published) {
            throw new \DomainException('Announcement is already published.');
        }

        $this->announcementRepository->updateStatus($id, true);

        // event(new AnnouncementPublishedEvent($announcement));
    }
}