<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\AppointOfficialDto;
use App\Core\Government\Exceptions\OfficialAlreadyAppointedException;
use App\Core\Government\Repositories\OfficialTermRepository;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Support\Facades\DB;

class AppointOfficialUseCase
{

    public function __construct(

        protected OfficialTermRepository $officialTermRepo,

        protected IdGeneratorInterface $idGeneratorInterface,

    ) {
    }

    public function execute(AppointOfficialDto $dto)
    {
        return DB::transaction(function () use ($dto) {

            if ($this->officialTermRepo->existsInTerm($dto->officialId, $dto->termId)) {

                throw new OfficialAlreadyAppointedException();

            }

            $appointRecordId = $this->idGeneratorInterface->generate();

            return $this->officialTermRepo->appoint($dto, $appointRecordId);

        });

    }

}