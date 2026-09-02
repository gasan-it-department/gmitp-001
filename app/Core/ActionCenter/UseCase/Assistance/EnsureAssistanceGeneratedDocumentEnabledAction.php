<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\Models\AssistanceRequest;

class EnsureAssistanceGeneratedDocumentEnabledAction
{
    public function execute(
        AssistanceRequest $request,
        AssistanceGeneratedDocument $document,
    ): void {
        $request->loadMissing('assistanceType');

        if ($request->assistanceType?->supportsGeneratedDocument($document)) {
            return;
        }

        throw new \DomainException(sprintf(
            '%s generation is not enabled for this assistance type.',
            $document->label(),
        ));
    }
}
