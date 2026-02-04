<?php

namespace App\Core\Government\Officials\UseCase;

use App\Core\Government\Officials\Dto\AddOfficialDto;
use App\Core\Government\Officials\Repositories\OfficialRepositories;

class AddOfficialUseCase
{

    public function __construct(

        protected OfficialRepositories $officialRepo,

    ) {
    }

    public function execute(AddOfficialDto $dto)
    {

        dd($dto);

        return $this->officialRepo->save();

    }

}