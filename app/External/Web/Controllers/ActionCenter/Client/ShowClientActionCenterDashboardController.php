<?php

namespace App\External\Web\Controllers\ActionCenter\Client;

use App\Core\ActionCenter\UseCase\Assistance\GetUserAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveApplicantProfileAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowClientActionCenterDashboardController extends Controller
{
    public function __invoke(
        Request $request,
        ResolveApplicantProfileAction $resolveProfileAction,
        GetUserAssistanceRequestAction $assistanceRequestAction
    ): Response {
        $userId = $request->user()->id;
        $municipalId = app('municipal_id');

        // Fetch beneficiary profile for status tracking
        $beneficiary = $resolveProfileAction->execute($userId, $municipalId);

        // Map beneficiary status state
        $profileState = null;
        if ($beneficiary) {
            $profileState = [
                'id' => $beneficiary->id,
                'full_name' => $beneficiary->full_name,
                'is_verified' => $beneficiary->isIdentityVerified(),
                'is_rejected' => $beneficiary->isIntakeRejected(),
                'rejection_reason' => $beneficiary->intake_rejection_reason,
                'identity_verified_at' => $beneficiary->identity_verified_at,
                'intake_rejected_at' => $beneficiary->intake_rejected_at,
            ];
        }

        // Fetch user assistance requests history
        $requests = $assistanceRequestAction->execute($userId, $municipalId);

        return Inertia::render('ActionCenter/Client/Dashboard/ActionCenterDashboard', [
            'profile' => $profileState,
            'requests' => AssistanceRequestListResource::collection($requests),
        ]);
    }
}
