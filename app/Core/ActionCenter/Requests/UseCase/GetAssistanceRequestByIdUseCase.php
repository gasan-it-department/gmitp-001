<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class GetAssistanceRequestByIdUseCase
{
    public function __construct(

        protected AssistanceRequestRepositories $assistanceRepo,

    ) {
    }

    public function execute(string $id)
    {

        return $this->assistanceRepo->findByIdWithBeneficiary($id);

    }

}