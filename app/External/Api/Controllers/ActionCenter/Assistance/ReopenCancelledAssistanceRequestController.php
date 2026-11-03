<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReopenCancelledAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\ReopenCancelledAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\ReopenCancelledAssistanceRequestRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

final class ReopenCancelledAssistanceRequestController extends Controller
{
    public function __invoke(ReopenCancelledAssistanceRequestRequest $request, string $assistanceRequestId, ReopenCancelledAssistanceRequestAction $action): RedirectResponse
    {
        try {
            $action->execute(new ReopenCancelledAssistanceRequestDto($assistanceRequestId, app('municipal_id'), $request->user()->id,
                $request->validated('reason'), $request->validated('context_token'), $request->validated('operation_key'),
                $request->boolean('confirm_not_released'), $request->boolean('confirm_papers_invalid')));

            return back()->with('success', 'Request reopened for review. Record and approve the correct amount again.');
        } catch (\DomainException $exception) {
            return back()->withErrors(['reopen_cancelled' => $exception->getMessage()]);
        }
    }
}
