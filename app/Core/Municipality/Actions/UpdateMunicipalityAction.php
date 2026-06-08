<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Dto\UpdateMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Rules\MunicipalityValidator;
use App\Core\Municipality\Services\SlugMunicipalityService;

class UpdateMunicipalityAction
{
    public function __construct(
        protected MunicipalityValidator $municipalityValidator,
        protected SlugMunicipalityService $slugService,
    ) {
    }

    public function execute(UpdateMunicipalityDto $dto): Municipality
    {
        $this->municipalityValidator->validate($dto);

        $slug = $this->slugService->slugMunicipality($dto->name, $dto->zipCode);

        $municipality = Municipality::findOrFail($dto->id);

        $municipality->update([
            'name' => $dto->name,
            'municipal_code' => $dto->code,
            'zip_code' => $dto->zipCode,
            'slug' => $slug,
            'is_active' => $dto->isActive,
        ]);

        return $municipality;
    }
}
