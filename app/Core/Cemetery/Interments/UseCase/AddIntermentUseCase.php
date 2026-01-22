<?php

namespace App\Core\Cemetery\Interments\UseCase;

use App\Core\Cemetery\Interments\Dto\AddIntermentsDto;
use App\Core\Cemetery\Interments\Repositories\IntermentsRepositories;

class AddIntermentUseCase
{

    public function __construct(

        protected IntermentsRepositories $intermentsRepo

    ) {
    }

    public function execute(AddIntermentsDto $dto)
    {

        return $this->intermentsRepo->save($dto);

    }

}