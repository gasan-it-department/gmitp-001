<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialRepository;

class GetOfficialProfileUseCase
{
    public function __construct(
        private OfficialRepository $officialRepo,
    ) {
    }

    public function execute(string $officialId, string $municipalId)
    {

        return $official = $this->officialRepo->findWithProfileById($officialId, $municipalId);

    }
}