<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialRepository;


class SearchOfficialUseCase
{

    public function __construct(

        private OfficialRepository $officialRepo,

    ) {
    }

    public function execute(string $query, string $municipalId)
    {

        if (strlen($query) < 3) {
            return collect([]);
        }

        return $this->officialRepo->search($query, $municipalId);
    }
}