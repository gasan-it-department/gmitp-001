<?php

namespace App\Core\Cemetery\Interments\UseCase;

use App\Core\Cemetery\Interments\Dto\AddIntermentsDto;
use App\Core\Cemetery\Interments\Repositories\IntermentsRepositories;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class AddIntermentUseCase
{

    public function __construct(

        protected IntermentsRepositories $intermentsRepo,

        protected IdGeneratorInterface $idGeneratorInterface

    ) {
    }

    public function execute(AddIntermentsDto $dto)
    {
        $intermentId = $this->idGeneratorInterface->generate();

        return $this->intermentsRepo->save($dto, $intermentId);

    }

}