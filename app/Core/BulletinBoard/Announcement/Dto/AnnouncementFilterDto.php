<?php

namespace App\Core\BulletinBoard\Announcement\Dto;

class AnnouncementFilterDto
{
    public function __construct(
        public readonly ?bool $isPublished = null,
        public readonly ?string $fromDate = null,
        public readonly ?string $toDate = null,
        public readonly ?string $search = null,
        public readonly int $perPage = 10,
        public readonly string $sort = 'desc',
    ) {
    }
}