<?php

namespace App\Core\BulletinBoard\Events\Dto;

class UpdateEventDto
{
    public function __construct(
        public readonly string $title,
        public readonly string $description,
        public readonly \DateTimeImmutable $eventDate
    ) {
    }
}