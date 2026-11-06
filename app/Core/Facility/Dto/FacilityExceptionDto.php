<?php

namespace App\Core\Facility\Dto;

readonly class FacilityExceptionDto extends FacilityMutationDto
{
    public function __construct(string $municipalId, int $revision, public array $data, public bool $notifyMobile = false)
    {
        parent::__construct($municipalId, $revision);
    }
}
