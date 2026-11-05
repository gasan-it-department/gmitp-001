<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\StoreFacilityExceptionDto;
use App\Core\Facility\Models\Facility;

class StoreFacilityExceptionAction
{
    public function __construct(private SaveFacilityExceptionAction $saveException) {}

    public function execute(string $facilityId, StoreFacilityExceptionDto $dto): Facility
    {
        return $this->saveException->execute($facilityId, $dto);
    }
}
