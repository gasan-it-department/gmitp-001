<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\StoreFacilityDto;
use App\Core\Facility\Models\Facility;
use Illuminate\Support\Facades\DB;

class StoreFacilityAction
{
    public function execute(StoreFacilityDto $dto): Facility
    {
        return DB::transaction(function () use ($dto) {
            $facility = Facility::create([...$dto->attributes, 'municipal_id' => $dto->municipalId, 'is_published' => false]);
            if ($dto->image) {
                $facility->addMedia($dto->image)->toMediaCollection('facility_image');
            }

            return $facility;
        });
    }
}
