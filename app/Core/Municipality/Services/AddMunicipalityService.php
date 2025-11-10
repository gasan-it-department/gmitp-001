<?php

namespace App\Core\Municipality\Services;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Repositories\MunicipalityRepository;
use App\Core\Municipality\Rules\MunicipalityValidator;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Services\SlugMunicipalityService;
class AddMunicipalityService
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected MunicipalityRepository $municipalityRepository,
        protected MunicipalityValidator $municipalityValidator,
        protected SlugMunicipalityService $slugService,
    ) {
    }


    public function execute(AddMunicipalityDto $dto): Municipality
    {
        $this->municipalityValidator->validate($dto);

        $slug = $this->slugService->slugMunicipality($dto->name, $dto->zipCode);

        $municipalityId = $this->idGenerator->generate();

        return $this->municipalityRepository->save($dto, $municipalityId, $slug);
    }
}
