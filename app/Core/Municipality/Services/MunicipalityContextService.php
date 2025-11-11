<?php

namespace App\Core\Municipality\Services;

use App\Core\Municipality\Repositories\MunicipalityRepository;
use App\Core\Municipality\Models\Municipality;

class MunicipalityContextService
{
    public function __construct(
        protected MunicipalityRepository $municipalityRepository,
    ) {
    }

    public function execute(string $slug): ?Municipality
    {
        return $this->municipalityRepository->findBySlug($slug);
    }
}