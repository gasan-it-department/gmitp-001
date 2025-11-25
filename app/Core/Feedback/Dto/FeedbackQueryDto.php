<?php

namespace App\Core\Feedback\Dto;

class FeedbackQueryDto
{

    public function __construct(
        public readonly int $page = 1,
        public readonly int $perPage = 10,
        public readonly string $orderBy = 'created_at',
        public readonly string $direction = 'desc',
    ) {
    }

}