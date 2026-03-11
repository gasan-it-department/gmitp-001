<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\OfficialTermRepository;

class GetOfficialTermUseCase
{

    public function __construct(

        private OfficialTermRepository $officialTermRepo,


    ) {
    }

    public function execute(string $termId)
    {

        return $this->officialTermRepo->getRosterByTerm($termId);

    }

}