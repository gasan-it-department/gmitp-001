<?php

namespace App\Core\BulletinBoard\Announcement\UseCase;

use App\Core\BulletinBoard\Announcement\Dto\AnnouncementQueryDto;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use App\Core\BulletinBoard\Announcement\Repository\AnnouncementRepository;

class GetPublishedAnnouncementsUseCase
{
    public function __construct(
        private AnnouncementRepository $repo,
    ) {
    }

    public function execute(string $municipalId, AnnouncementQueryDto $dto): LengthAwarePaginator
    {

        return $this->repo->getPublished($municipalId, true, $dto);

    }
}