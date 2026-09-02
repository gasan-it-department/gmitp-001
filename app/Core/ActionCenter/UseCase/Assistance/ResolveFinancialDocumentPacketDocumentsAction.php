<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceGeneratedDocument;
use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Auth\Access\AuthorizationException;

class ResolveFinancialDocumentPacketDocumentsAction
{
    /** @return array<int, AssistanceGeneratedDocument> */
    public function execute(
        string $assistanceRequestId,
        string $municipalId,
    ): array {
        $request = AssistanceRequest::query()
            ->with('assistanceType')
            ->findOrFail($assistanceRequestId);

        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException(
                'You may only generate a processing document packet for your own municipality.',
            );
        }

        $documents = array_values(array_filter(
            AssistanceGeneratedDocument::financialPacketCases(),
            fn (AssistanceGeneratedDocument $document): bool => $request->assistanceType
                ?->supportsGeneratedDocument($document) === true,
        ));

        if (count($documents) < 2) {
            throw new \DomainException(
                'Enable at least two processing documents for this assistance type before generating a packet.',
            );
        }

        return $documents;
    }
}
