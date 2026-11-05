<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Models\Facility;

class DeleteFacilityExceptionAction extends FacilityMutationAction
{
    public function execute(string $id, string $exceptionId, FacilityMutationDto $dto): Facility
    {
        return $this->mutate($id, $dto, function (Facility $facility) use ($exceptionId) {
            $exception = $facility->exceptions()->where('municipal_id', $facility->municipal_id)->whereKey($exceptionId)->firstOrFail();
            $before = $exception->load('periods')->toArray();
            $exception->delete();
            $this->audit($facility, 'Schedule exception removed; weekly hours restored', $before, []);
        });
    }
}
