<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\OfficialQueryDto;
use App\Core\Government\Repositories\OfficialRepository;

class ListOfficialUseCase
{
    public function __construct(

        private OfficialRepository $officialRepo,

    ) {
    }

    public function execute(string $municipalId, OfficialQueryDto $filters)
    {

        return $this->officialRepo->getPaginatedList($municipalId, $filters);

    }
}