<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\AppointOfficialDto;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;
use App\Core\Government\Officials\Repositories\OfficialRepositories;

class AppointOfficialUseCase
{

    public function __construct(

        protected OfficialRepositories $officialRepo,

        protected IdGeneratorInterface $idGeneratorInterface,

    ) {
    }

    public function execute(AppointOfficialDto $dto)
    {

        return DB::transaction(function () use ($dto) {

            if ($dto->isNewOfficial()) {

                $officialId = $this->idGeneratorInterface->generate();

                $this->officialRepo->createProfile($dto, $officialId);

            } else {

                $officialId = $dto->existingOfficialId;

            }

            $appointRecordId = $this->idGeneratorInterface->generate();

            $this->officialRepo->appoint($dto, $appointRecordId, $officialId);

        });

    }

}