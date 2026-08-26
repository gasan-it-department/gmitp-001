<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\CancelApprovedAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\CancelApprovedAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\CancelApprovedAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class CancelApprovedAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly CancelApprovedAssistanceRequestAction $cancelApprovedRequest,
    ) {}

    public function __invoke(
        CancelApprovedAssistanceRequestRequest $request,
        string $assistanceRequestId,
    ): RedirectResponse {
        try {
            $user = $request->user();

            $this->cancelApprovedRequest->execute(
                CancelApprovedAssistanceRequestDto::fromRequest(
                    request: $request,
                    assistanceRequestId: $assistanceRequestId,
                    municipalId: app('municipal_id'),
                    userId: $user->id,
                    userName: $user->full_name,
                ),
            );

            return back()->with(
                'success',
                'The approved request was cancelled before release. A corrected request may now be filed.',
            );
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors([
                'cancel_approved' => $exception->getMessage(),
            ]);
        }
    }
}
