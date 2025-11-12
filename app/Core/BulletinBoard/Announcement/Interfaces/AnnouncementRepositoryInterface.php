<?php

namespace App\Core\BulletinBoard\Announcement\Interfaces;

use App\Core\BulletinBoard\Announcement\Models\Announcement;
use App\Core\BulletinBoard\Announcement\Dto\CreateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementFilterDto;

interface AnnouncementRepositoryInterface
{
    public function save(CreateAnnouncementDto $dto, string $announcementId, string $municipalId): Announcement;
    public function findById(string $id): Announcement;
    public function updateStatus($id, bool $isPublish): void;
    public function getFiltered(AnnouncementFilterDto $dto): Announcement;
}