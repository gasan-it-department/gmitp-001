<?php

namespace App\Core\Facility\Dto;

readonly class FacilityMutationDto
{
    public function __construct(
        public string $municipalId,
        public int $revision,
    ) {}
}
