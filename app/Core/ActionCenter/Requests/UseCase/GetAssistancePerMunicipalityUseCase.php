<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Dto\AssistanceQueryDto;
use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class GetAssistancePerMunicipalityUseCase
{

    public function __construct(

        protected AssistanceRequestRepositories $assistanceRepo,

    ) {
    }

    public function execute(string $municipalId, AssistanceQueryDto $dto)
    {

        return $this->assistanceRepo->getAllPerMunicipality(

            municipalId: $municipalId,

            dto: $dto

        );

    }

}