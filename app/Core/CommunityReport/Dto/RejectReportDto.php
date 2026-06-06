<?php

namespace App\Core\CommunityReport\Dto;

readonly class RejectReportDto
{
    public function __construct(
        public string $municipalId,
        public string $reportId,
        public string $actorUserId,
        public string $rejectionReason,
    ) {
    }
}
