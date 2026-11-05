<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Models\Facility;

class DeleteFacilityAction extends FacilityMutationAction
{
    public function execute(string $id, FacilityMutationDto $dto): void
    {
        $this->mutate($id, $dto, fn (Facility $facility) => $facility->delete());
    }
}
