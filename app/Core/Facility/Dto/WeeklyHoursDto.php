<?php

namespace App\Core\Facility\Dto;

readonly class WeeklyHoursDto extends FacilityMutationDto
{
    public function __construct(string $municipalId, int $revision, public array $days)
    {
        parent::__construct($municipalId, $revision);
    }
}
