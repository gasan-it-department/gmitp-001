<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\UpdateAssistanceDocumentCheckDto;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;

class UpdateAssistanceDocumentCheckAction
{
    public function __construct(private readonly AssistanceMswdVerificationService $verification) {}

    public function execute(UpdateAssistanceDocumentCheckDto $dto): AssistanceRequest
    {
        return $this->verification->updateDocumentCheck(
            $dto->assistanceRequestId,
            $dto->municipalId,
            $dto->actorId,
            $dto->documentKey,
            [
                'status' => $dto->status,
                'media_id' => $dto->mediaId,
                'media_version' => $dto->mediaVersion,
                'presented_copy_type' => $dto->presentedCopyType,
                'physical_inspected' => $dto->physicalInspected,
                'remarks' => $dto->remarks,
            ],
        );
    }
}
