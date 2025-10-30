<?php

namespace App\Core\BulletinBoard\Announcement\Dto;

final class CreateAnnouncementDto
{
    public function __construct(
        public readonly string $title,
        public readonly string $message,
        public readonly string $userId,
    ) {
    }
}