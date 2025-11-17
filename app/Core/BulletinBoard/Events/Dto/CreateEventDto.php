<?php

namespace App\Core\BulletinBoard\Events\Dto;

class CreateEventDto
{
    public function __construct(
        public readonly string $title,
        public readonly string $description,
        public readonly \DateTimeImmutable $eventDate,
        public readonly string $userId,
        public readonly bool $isPublish,
    ) {
    }
}