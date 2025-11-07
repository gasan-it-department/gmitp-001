<?php

namespace App\Core\Municipality\Services;
use App\Core\Municipality\Models\Municipality;
use App\Core\Municipality\Repositories\MunicipalityRepository;

class GetActiveMunicipality
{
    public function __construct(
        private MunicipalityRepository $municipalityRepository
    ) {
    }

    public function execute()
    {
        return $this->municipalityRepository->getActiveStatus();
    }
}