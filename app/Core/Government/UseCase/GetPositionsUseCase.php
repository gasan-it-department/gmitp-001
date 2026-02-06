<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Repositories\PositionRepository;

class GetPositionsUseCase
{

    public function __construct(

        private PositionRepository $positionRepo,

    ) {
    }

    public function execute()
    {

        return $this->positionRepo->getAll();

    }

}