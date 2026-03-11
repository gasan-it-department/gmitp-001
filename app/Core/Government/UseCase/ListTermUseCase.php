<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\TermRepository;

class ListTermUseCase
{

    public function __construct(

        protected TermRepository $termRepo,

    ) {
    }

    public function execute(string $municipalId)
    {

        return $this->termRepo->getByMunicipality($municipalId);

    }


}