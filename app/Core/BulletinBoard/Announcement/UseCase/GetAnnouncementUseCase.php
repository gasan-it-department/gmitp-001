<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Core\BulletinBoard\Announcement\Dto\AnnouncementQueryDto;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class GetAnnouncementUseCase
{
    public function __construct(
        protected AnnouncementRepository $announcementRepository,
    ) {
    }

    public function execute(AnnouncementQueryDto $dto, string $municipalId): LengthAwarePaginator
    {

        return $this->announcementRepository->getAll($municipalId, $dto);

    }
}