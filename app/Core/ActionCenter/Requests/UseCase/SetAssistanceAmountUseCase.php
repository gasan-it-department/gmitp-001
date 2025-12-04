<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Dto\SetAssistanceAmountDto;
use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class SetAssistanceAmountUseCase
{
    public function __construct(
        protected AssistanceRequestRepositories $assistanceReqRepo,
    ) {
    }

    public function execute(SetAssistanceAmountDto $dto)
    {

        $assistanceRequest = $this->assistanceReqRepo->findById($dto->assistanceId);

        $assistanceRequest->amount = $dto->amount;

        $assistanceRequest->save();

    }

}