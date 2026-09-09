<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReassignAssistanceMswdReviewerDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;

class ReassignAssistanceMswdReviewerAction
{
    public function __construct(private readonly AssistanceMswdVerificationService $verification) {}

    public function execute(ReassignAssistanceMswdReviewerDto $dto): AssistanceRequest
    {
        return $this->verification->reassign(
            $dto->assistanceRequestId,
            $dto->municipalId,
            $dto->actorId,
            $dto->reviewerId,
            $dto->reason,
        );
    }
}
