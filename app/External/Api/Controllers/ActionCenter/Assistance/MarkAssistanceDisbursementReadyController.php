<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\MarkAssistanceDisbursementReadyAction;
use App\External\Api\Request\ActionCenter\ConfirmAssistanceDisbursementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class MarkAssistanceDisbursementReadyController extends Controller
{
    public function __construct(private readonly MarkAssistanceDisbursementReadyAction $markReady) {}

    public function __invoke(
        ConfirmAssistanceDisbursementRequest $request,
        string $assistanceRequestId,
        string $disbursementId,
    ): RedirectResponse {
        try {
            $result = $this->markReady->execute(
                $assistanceRequestId,
                $disbursementId,
                app('municipal_id'),
                (string) $request->user()->id,
            );

            $message = match ($result->notification_status) {
                'sent' => 'Disbursement marked ready. Semaphore sent the claim notice to the mobile network.',
                'submitted' => 'Disbursement marked ready. The claim notice was accepted by Semaphore.',
                default => 'Disbursement marked ready, but the claim notice was not submitted.',
            };

            return back()->with('success', $message);
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement' => $exception->getMessage()]);
        }
    }
}
