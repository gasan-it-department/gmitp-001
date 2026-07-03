<?php

namespace App\Core\Cemetery\Actions\Sites;

use App\Core\Cemetery\Dto\Sites\UpdateCemeterySiteDto;
use App\Core\Cemetery\Models\CemeterySite;

class UpdateCemeterySiteAction
{
    public function execute(UpdateCemeterySiteDto $dto): CemeterySite
    {
        $site = CemeterySite::query()
            ->forMunicipality($dto->municipalId)
            ->findOrFail($dto->cemeterySiteId);

        $site->update([
            'name' => $dto->name,
            'psgc_barangay_code' => $dto->psgcBarangayCode,
            'street_name' => $dto->streetName,
            'notes' => $dto->notes,
        ]);

        return $site;
    }
}
