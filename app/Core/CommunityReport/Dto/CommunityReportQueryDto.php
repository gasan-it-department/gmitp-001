<?php

namespace App\Core\CommunityReport\Dto;

class CommunityReportQueryDto
{
    public function __construct(
        public ?int $perPage = 10,
        public ?string $orderBy = 'created_at',
        public ?string $direction = 'desc',
    ) {
    }
}