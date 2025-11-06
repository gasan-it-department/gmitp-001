<?php

namespace App\Core\Municipality\Services;

use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Repositories\MunicipalityRepository;
use App\Core\Municipality\Rules\MunicipalityValidator;
;
class AddMunicipalityService
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected MunicipalityRepository $municipalityRepository,
        protected MunicipalityValidator $municipalityValidator,
    ) {
    }


    public function execute(AddMunicipalityDto $dto): void
    {
        $this->municipalityValidator->validate($dto);

        $municipalityId = $this->idGenerator->generate();

        $this->municipalityRepository->save($dto, $municipalityId);
    }
}
