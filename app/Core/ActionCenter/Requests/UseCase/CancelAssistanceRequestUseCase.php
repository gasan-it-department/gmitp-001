<?php

namespace App\Core\ActionCenter\Requests\UseCase;

use App\Core\ActionCenter\Requests\Enums\RequestStatus;
use App\Core\ActionCenter\Requests\Repositories\AssistanceRequestRepositories;

class CancelAssistanceRequestUseCase
{

    public function __construct(

        public AssistanceRequestRepositories $assistanceRequestRepo,

    ) {
    }

    public function execute(string $requestId, string $userId)
    {

        $request = $this->assistanceRequestRepo->findOwnedRequest($userId, $requestId);

        if ($request->status !== RequestStatus::PENDING) {

            throw new \Exception("Only pending requests can be cancelled.");

        }

        $request->status = RequestStatus::CANCELLED;

        $request->save();

        return $request;

    }

}