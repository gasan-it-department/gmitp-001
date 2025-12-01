<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Dto\DeleteMultipleAnnouncementDto;
use Illuminate\Support\Facades\DB;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class DeleteMultipleAnnouncementUseCase
{
    public function __construct(

        protected AnnouncementRepository $announcementRepo,

    ) {
    }

    public function execute(DeleteMultipleAnnouncementDto $dto)
    {
        return DB::transaction(function () use ($dto) {

            return $this->announcementRepo->multipleDelete($dto->ids);

        });
    }
}