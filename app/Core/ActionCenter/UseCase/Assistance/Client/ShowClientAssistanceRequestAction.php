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
     * @param string $userId
     * @param string $assistanceRequestId
     * @return AssistanceRequest
     *
     * @throws ModelNotFoundException
     * @throws AccessDeniedHttpException
     */
    public function execute(string $userId, string $assistanceRequestId): AssistanceRequest
    {
        // 1. Find the request or fail
        $request = AssistanceRequest::findOrFail($assistanceRequestId);

        // 2. Security Check: Does this request belong to the current user?
        // We traverse through the beneficiary link.
        $beneficiary = Beneficiary::where('id', $request->beneficiary_id)
            ->where('user_id', $userId)
            ->first();

        if (!$beneficiary) {
            throw new AccessDeniedHttpException('You are not authorized to view this assistance request.');
        }

        // 3. Eager load relations for the detail view
        return $request->load([
            'assistanceType',
            'encodedBy',
            'reviewedBy',
            'approvedBy',
            'media',
        ]);
    }
}
