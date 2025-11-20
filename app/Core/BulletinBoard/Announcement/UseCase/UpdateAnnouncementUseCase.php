<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Dto\UpdateAnnouncementDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class UpdateAnnouncementUseCase
{

    public function __construct(

        protected AnnouncementRepository $announcementRepo

    ) {
    }
    public function execute(string $id, UpdateAnnouncementDto $dto)
    {

        return $this->announcementRepo->update($dto, $id);

    }
}
