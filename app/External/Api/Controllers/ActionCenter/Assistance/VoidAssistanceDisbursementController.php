<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\Dto\Assistance\VoidAssistanceDisbursementDto;
use App\Core\ActionCenter\UseCase\Assistance\VoidAssistanceDisbursementAction;
use App\External\Api\Request\ActionCenter\VoidAssistanceDisbursementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class VoidAssistanceDisbursementController extends Controller
{
    public function __construct(private readonly VoidAssistanceDisbursementAction $void) {}

    public function __invoke(
        VoidAssistanceDisbursementRequest $request,
        string $assistanceRequestId,
        string $disbursementId,
    ): RedirectResponse {
        try {
            $this->void->execute(new VoidAssistanceDisbursementDto(
                assistanceRequestId: $assistanceRequestId,
                disbursementId: $disbursementId,
                municipalId: app('municipal_id'),
                actorId: (string) $request->user()->id,
                reason: trim((string) $request->validated('reason')),
            ));

            return back()->with('success', 'Disbursement voided. A replacement may now be prepared.');
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement' => $exception->getMessage()]);
        }
    }
}
