<?php

namespace App\Core\BulletinBoard\Announcement\Repository;

use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Models\Announcement;

class AnnouncementRepository
{
    public function save(CreateAnnouncementDto $dto): Announcement
    {
        $announcement = Announcement::create([
            'id' => $dto->id,
            'title' => $dto->title,
            'message' => $dto->message,
        ]);
        return $announcement;
    }
}