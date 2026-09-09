<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CompleteAssistanceMswdVerificationDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;

class CompleteAssistanceMswdVerificationAction
{
    public function __construct(private readonly AssistanceMswdVerificationService $verification) {}

    public function execute(CompleteAssistanceMswdVerificationDto $dto): AssistanceRequest
    {
        return $this->verification->complete(
            $dto->assistanceRequestId,
            $dto->municipalId,
            $dto->actorId,
            $dto->expectedFingerprint,
        );
    }
}
