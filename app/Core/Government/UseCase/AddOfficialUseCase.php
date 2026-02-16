<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\AddOfficialDto;
use App\Core\Government\Repositories\OfficialRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class AddOfficialUseCase
{

    public function __construct(

        protected OfficialRepository $officialRepo,
        protected IdGeneratorInterface $idGenerator,

    ) {
    }

    public function execute(AddOfficialDto $dto)
    {

        $officialId = $this->idGenerator->generate();

        return $this->officialRepo->addOfficial($dto, $officialId);

    }

}