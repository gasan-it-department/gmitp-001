<?php

namespace App\Core\ActionCenter\UseCase\Assistance\Client;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ShowClientAssistanceRequestAction
{
    /**
     * Get the full details of a specific assistance request for a client.
     *
     * Ensures the request exists and actually belongs to the authenticated user
     * before returning it with necessary relations eager-loaded.
     *
     *
     * @throws ModelNotFoundException
     * @throws AccessDeniedHttpException
     */
    public function execute(string $userId, string $assistanceRequestId, string $municipalId): AssistanceRequest
    {
        // 1. Find the request or fail
        $request = AssistanceRequest::findOrFail($assistanceRequestId);

        // 2. Security Check: does this request belong to the current user's
        // record IN THIS municipality? Traversing the beneficiary link and
        // scoping to the tenant keeps a Boac request off the Gasan portal.
        $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
            ->where('user_id', $userId)
            ->where('municipal_id', $municipalId)
            ->first();

        if (! $beneficiary) {
            throw new AccessDeniedHttpException('You are not authorized to view this assistance request.');
        }

        // 3. Eager load relations for the detail view
        return $request->load([
            'snapshot',
            'assistanceType.documents' => fn ($query) => $query
                ->orderBy('ac_assistance_type_documents.sort_order'),
            'media',
        ]);
    }
}
