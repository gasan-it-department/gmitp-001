<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Dto\CreateAssistanceDto;
use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;
use App\Core\ActionCenter\Requests\Services\TransactionNumberGenerator;
use App\Shared\IdGenerator\Services\IdGenerator;

class CreateAssistanceRequestUseCase
{
    public function __construct(

        protected AssistanceRequestRepositories $assistanceRepo,

        protected IdGenerator $idGenerator,

        protected TransactionNumberGenerator $transactionNumber,

    ) {
    }

    public function execute(CreateAssistanceDto $dto, string $municipalId)
    {

        $assistanceId = $this->idGenerator->generate();

        $transactionNumber = $this->transactionNumber->generate();

        $assistance = $this->assistanceRepo->save(

            dto: $dto,

            assistanceId: $assistanceId,

            transactionNumber: $transactionNumber,

            municipalId: $municipalId,

        );

        return $assistance;

    }

}