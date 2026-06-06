<?php

namespace App\Core\CommunityReport\Dto;

readonly class AcknowledgeReportDto
{
    public function __construct(
        public string  $municipalId,
        public string  $reportId,
        public string  $actorUserId,
        public ?string $acknowledgementNote = null,
    ) {
    }
}
