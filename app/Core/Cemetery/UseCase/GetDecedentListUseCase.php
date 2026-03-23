<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Models\Decedent;
use App\Core\Cemetery\Repositories\DecedentsRepository;

class GetDecedentListUseCase
{

    public function __construct(
        private DecedentsRepository $decedentRepo,
    ) {
    }
    public function execute(string $municipalId)
    {

        return $this->decedentRepo->getMunicipalitiesDecedents($municipalId);

    }

}