<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialRepository;

class ListOfficialUseCase
{
    public function __construct(

        private OfficialRepository $officialRepo,

    ) {
    }

    public function execute(string $municipalId)
    {

        return $this->officialRepo->getAll($municipalId);

    }
}