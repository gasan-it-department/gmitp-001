<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\UpdateFacilityExceptionDto;
use App\Core\Facility\Models\Facility;

class UpdateFacilityExceptionAction
{
    public function __construct(private SaveFacilityExceptionAction $saveException) {}

    public function execute(string $facilityId, string $exceptionId, UpdateFacilityExceptionDto $dto): Facility
    {
        return $this->saveException->execute($facilityId, $dto, $exceptionId);
    }
}
