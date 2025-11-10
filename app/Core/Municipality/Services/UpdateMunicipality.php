<?php

namespace App\Core\Municipality\Services;

use App\Core\Municipality\Repositories\MunicipalityRepository;
use App\Core\Municipality\Dto\UpdateMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Rules\MunicipalityValidator;
use App\Core\Municipality\Services\SlugMunicipalityService;

class UpdateMunicipality
{
    public function __construct(
        private MunicipalityRepository $municipalityRepository,
        protected MunicipalityValidator $municipalityValidator,
        protected SlugMunicipalityService $slugService,
    ) {
    }


    public function execute(UpdateMunicipalityDto $dto): Municipality
    {
        $this->municipalityValidator->validate($dto);

        $slug = $this->slugService->slugMunicipality($dto->name, $dto->zipCode);

        $municipality = $this->municipalityRepository->update($dto, $slug);

        return $municipality;
    }
}