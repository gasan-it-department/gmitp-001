<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceMswdReasonDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;

class ReturnAssistanceForCorrectionAction
{
    public function __construct(private readonly AssistanceMswdVerificationService $verification) {}

    public function execute(AssistanceMswdReasonDto $dto): AssistanceRequest
    {
        return $this->verification->returnForCorrection($dto->assistanceRequestId, $dto->municipalId, $dto->actorId, $dto->reason);
    }
}
