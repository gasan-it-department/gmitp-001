<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\AddTermDto;
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

    public function execute(AddTermDto $dto)
    {

        $termId = $this->idGeneratorInterface->generate();

        $term = $this->termRepo->save($termId, $dto);

    }

}