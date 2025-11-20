<?php

namespace App\Core\BulletinBoard\Announcement\Dto;

class UpdateAnnouncementDto
{
    public function __construct(

        public readonly string $title,

        public readonly string $message,

        public readonly string $userId,

    ) {
    }
}