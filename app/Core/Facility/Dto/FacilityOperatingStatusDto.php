<?php

namespace App\Core\Facility\Dto;

use App\Core\Facility\Enums\FacilityOperatingStatus;
use Carbon\CarbonImmutable;

readonly class FacilityOperatingStatusDto extends FacilityMutationDto
{
    public function __construct(string $municipalId, int $revision, public FacilityOperatingStatus $status,
        public ?string $notice, public ?CarbonImmutable $expectedReopensAt = null, public ?array $todayException = null,
        public bool $notifyMobile = false)
    {
        parent::__construct($municipalId, $revision);
    }
}
