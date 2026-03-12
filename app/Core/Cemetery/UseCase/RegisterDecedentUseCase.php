<?php

namespace App\Core\Cemetery\UseCase;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Repositories\DecedentsRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class RegisterDecedentUseCase
{

    public function __construct(
        private DecedentsRepository $decedentRepo,
        private IdGeneratorInterface $idGenerator,
    ) {
    }
    public function execute(DecedentDto $dto)
    {
        $decedentId = $this->idGenerator->generate();

        return $this->decedentRepo->save($dto, $decedentId);

    }

}