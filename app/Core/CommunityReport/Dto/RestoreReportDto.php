<?php

namespace App\Core\CommunityReport\Dto;

readonly class RestoreReportDto
{
    public function __construct(
        public string $municipalId,
        public string $reportId,
        public string $actorUserId,
    ) {}
}
