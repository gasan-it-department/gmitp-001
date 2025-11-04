<?php

namespace App\Core\Municipality\Services;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Repositories\MunicipalityRepository;

class AddMunicipalityService
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected MunicipalityRepository $municipalityRepository,
    ) {}


    public function execute(AddMunicipalityDto $dto)
    {
        $municipalityId = $this->idGenerator->generate();

        $municipality = $this->municipalityRepository->save($dto, $municipalityId);
    }
}
