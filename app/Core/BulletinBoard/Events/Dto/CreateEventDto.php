<?php

namespace App\Core\BulletinBoard\Events\Dto;

class CreateEventDto
{
    public function __construct(
        public readonly string $title,
        public readonly string $message,
        public readonly \DateTimeImmutable $eventDateAndTime,
        public readonly string $userId,
    ) {
    }
}