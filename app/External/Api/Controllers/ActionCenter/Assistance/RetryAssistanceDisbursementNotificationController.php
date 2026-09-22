<?php

namespace App\External\Api\Controllers\ActionCenter\Assistance;

use App\Core\ActionCenter\UseCase\Assistance\SendAssistanceDisbursementNotificationAction;
use App\External\Api\Request\ActionCenter\ConfirmAssistanceDisbursementRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class RetryAssistanceDisbursementNotificationController extends Controller
{
    public function __construct(private readonly SendAssistanceDisbursementNotificationAction $notify) {}

    public function __invoke(
        ConfirmAssistanceDisbursementRequest $request,
        string $assistanceRequestId,
        string $disbursementId,
    ): RedirectResponse {
        try {
            $result = $this->notify->execute(
                $assistanceRequestId,
                $disbursementId,
                app('municipal_id'),
                (string) $request->user()->id,
            );

            return match ($result->notification_status) {
                'sent' => back()->with('success', 'Semaphore sent the claim notice to the mobile network.'),
                'submitted' => back()->with('success', 'The claim notice was accepted by Semaphore.'),
                default => back()->withErrors(['disbursement_notification' => $result->notification_failure]),
            };
        } catch (\DomainException|AuthorizationException $exception) {
            return back()->withErrors(['disbursement_notification' => $exception->getMessage()]);
        }
    }
}
