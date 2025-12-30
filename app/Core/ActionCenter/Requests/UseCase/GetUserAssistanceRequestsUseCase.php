<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class GetUserAssistanceRequestsUseCase
{

    public function __construct(
        protected AssistanceRequestRepositories $assistanceRequestRepo

    ) {
    }

    public function execute(string $userId)
    {

        return $this->assistanceRequestRepo->getByUserId($userId);

    }

}