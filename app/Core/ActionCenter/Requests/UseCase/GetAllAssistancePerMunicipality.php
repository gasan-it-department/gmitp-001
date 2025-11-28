<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class GetAllAssistancePerMunicipality
{

    public function __construct(

        protected AssistanceRequestRepositories $assistanceRepo,

    ) {
    }

    public function execute(string $municipalId)
    {

        return $assistance = $this->assistanceRepo->getAll(municipalId: $municipalId);

    }

}