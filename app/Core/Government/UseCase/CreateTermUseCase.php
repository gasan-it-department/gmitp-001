<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\TermDto;
use App\Core\Government\Repositories\TermRepository;
use App\External\Api\Request\Government\TermRequest;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class CreateTermUseCase
{

    public function __construct(

        protected TermRepository $termRepo,

        protected IdGeneratorInterface $idGeneratorInterface,

    ) {
    }

    public function execute(TermDto $dto)
    {

        if ($this->termRepo->exists($dto->municipalId, $dto->name, $dto->statutoryStart, $dto->statutoryEnd)) {
            throw new \Exception("A term with this name and duration already exists for your municipality.");
        }

        $this->termRepo->markAllAsInactive($dto->municipalId);

        $termId = $this->idGeneratorInterface->generate();

        return $this->termRepo->save($termId, $dto);

    }

}