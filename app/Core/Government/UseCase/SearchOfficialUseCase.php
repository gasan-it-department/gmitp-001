<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Officials\Repositories\OfficialRepositories;

class SearchOfficialsUseCase
{

    public function __construct(

        private OfficialRepositories $officialRepo,

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