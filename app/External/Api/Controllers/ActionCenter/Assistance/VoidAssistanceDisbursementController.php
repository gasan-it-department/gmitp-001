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
            $disbursement = $this->void->execute(new VoidAssistanceDisbursementDto(
                assistanceRequestId: $assistanceRequestId,
                disbursementId: $disbursementId,
                municipalId: app('municipal_id'),
                actorId: (string) $request->user()->id,
                reason: trim((string) $request->validated('reason')),
            ));

            $message = 'Disbursement voided. A replacement may now be prepared.';
            if (count(data_get($disbursement->metadata, 'manual_contacts', [])) > 0) {
                $message .= ' The claimant was previously contacted manually; notify them manually that this claim notice was cancelled.';
            }

            return back()->with('success', $message);
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement' => $exception->getMessage()]);
        }
    }
}
