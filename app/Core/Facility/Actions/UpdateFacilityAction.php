<?php

namespace App\Core\Facility\Actions;

use App\Core\Facility\Dto\UpdateFacilityDto;
use App\Core\Facility\Dto\FacilityMutationDto;
use App\Core\Facility\Models\Facility;
use Illuminate\Validation\ValidationException;

class UpdateFacilityAction extends FacilityMutationAction
{
    public function execute(string $id, UpdateFacilityDto $dto): Facility
    {
        return $this->mutate($id, new FacilityMutationDto($dto->municipalId, $dto->revision), function (Facility $facility) use ($dto) {
            $facility->fill($dto->attributes);
            if ($facility->is_published && ! $facility->location_name && ! $facility->address) {
                throw ValidationException::withMessages(['location_name' => 'Published facilities need a location or address.']);
            }
            if ($dto->image) {
                $facility->addMedia($dto->image)->toMediaCollection('facility_image');
                $this->audit($facility, 'Facility image replaced', [], ['image' => true]);
            } elseif ($dto->removeImage) {
                $facility->clearMediaCollection('facility_image');
                $this->audit($facility, 'Facility image removed', ['image' => true], []);
            }
        });
    }
}
