<?php

namespace App\Core\Municipality\Services;

use App\Core\Municipality\Repositories\MunicipalityRepository;
use Illuminate\Database\Eloquent\Collection;


class GetAllMunicipalities
{
    public function __construct(
        private MunicipalityRepository $municipalityRepository
    ) {
    }

    public function execute(): Collection
    {
        return $this->municipalityRepository->getAll();
    }
}