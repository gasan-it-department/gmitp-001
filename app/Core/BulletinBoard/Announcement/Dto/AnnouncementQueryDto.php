<?php

namespace App\Core\BulletinBoard\Announcement\Dto;

class AnnouncementQueryDto
{
    public function __construct(

        public readonly ?int $perPage = 10,

        public readonly ?string $orderBy = 'created_at',

        public readonly ?string $direction = 'desc',

        public readonly ?bool $isPublished = true,

        public readonly ?string $search = null,

    ) {
    }
}