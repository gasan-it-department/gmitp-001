<?php

namespace App\External\Api\Controllers\Government\Position;

use App\Core\Government\UseCase\GetPositionsUseCase;

class GetAllPositionController
{

    public function __construct(
        private GetPositionsUseCase $getPositionsUseCase,
    ) {
    }

}