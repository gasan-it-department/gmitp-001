<?php

namespace App\Core\Municipality\Actions;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Services\SlugMunicipalityService;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class AddMunicipalityAction
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected SlugMunicipalityService $slugService,
    ) {
    }

    public function execute(AddMunicipalityDto $dto): Municipality
    {
        $slug = $this->slugService->slugMunicipality($dto->name, $dto->zipCode);

        return Municipality::create([
            'id' => $this->idGenerator->generate(),
            'name' => $dto->name,
            'psgc_municipal_id' => $dto->psgcMunicipalId,
            'municipal_code' => $dto->code,
            'is_active' => $dto->isActive,
            'slug' => $slug,
            'zip_code' => $dto->zipCode,
        ]);
    }
}
