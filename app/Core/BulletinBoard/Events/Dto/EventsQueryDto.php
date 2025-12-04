<?php

namespace App\Core\BulletinBoard\Events\Dto;

class EventsQueryDto
{
    public function __construct(

        public readonly ?int $perPage = 10,

        public readonly ?string $orderBy = 'created_at',

        public readonly ?string $direction = 'desc',

        public readonly ?string $search = null,

        public readonly ?bool $isPublished = true,

    ) {
    }
}