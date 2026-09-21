<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceDisbursementSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class SendAssistanceDisbursementNotificationAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly AssistanceDisbursementSmsNotifier $notifier,
    ) {}

    public function execute(string $requestId, string $disbursementId, string $municipalId, string $actorId): AssistanceDisbursement
    {
        [$request, $disbursement] = DB::transaction(function () use ($requestId, $disbursementId, $municipalId): array {
            $this->lockMunicipality->execute($municipalId);
            $request = AssistanceRequest::query()
                ->with('beneficiary')
                ->whereKey($requestId)
                ->lockForUpdate()
                ->firstOrFail();
            if ($request->municipal_id !== $municipalId) {
                throw new AuthorizationException('You may only notify claimants in your own municipality.');
            }

            $disbursement = AssistanceDisbursement::query()
                ->whereKey($disbursementId)
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->firstOrFail();
            if ($disbursement->status !== AssistanceDisbursementStatus::Ready) {
                throw new \DomainException('Only a ready disbursement can send a claim notification.');
            }
            if ($disbursement->notification_status === 'sent') {
                throw new \DomainException('The claim notification was already sent successfully.');
            }
            if ($disbursement->notification_status === 'sending'
                && $disbursement->notification_attempted_at?->greaterThan(now()->subMinutes(5))) {
                throw new \DomainException('A claim notification attempt is already in progress.');
            }

            $disbursement->update([
                'notification_status' => 'sending',
                'notification_attempts' => $disbursement->notification_attempts + 1,
                'notification_attempted_at' => now(),
                'notification_failure' => null,
            ]);

            return [$request, $disbursement->fresh()];
        }, attempts: 3);

        $outcome = $this->notifier->ready($request, $disbursement);

        return DB::transaction(function () use ($request, $disbursement, $municipalId, $actorId, $outcome): AssistanceDisbursement {
            $this->lockMunicipality->execute($municipalId);
            $lockedRequest = AssistanceRequest::query()
                ->whereKey($request->id)
                ->lockForUpdate()
                ->firstOrFail();
            $current = AssistanceDisbursement::query()->whereKey($disbursement->id)->lockForUpdate()->firstOrFail();
            if ($current->status !== AssistanceDisbursementStatus::Ready) {
                return $current;
            }

            $current->update([
                'notification_status' => $outcome['status'],
                'notification_phone' => $outcome['phone'],
                'notification_message' => $outcome['message'],
                'notification_sent_at' => $outcome['status'] === 'sent' ? now() : null,
                'notification_failure' => $outcome['failure'],
            ]);

            activity('assistance_request')
                ->performedOn($lockedRequest)
                ->causedBy(User::find($actorId))
                ->withProperties([
                    'event' => 'disbursement_claim_notification',
                    'disbursement_id' => $current->id,
                    'notification_status' => $outcome['status'],
                    'notification_phone' => $outcome['phone'],
                    'notification_attempt' => $current->notification_attempts,
                    'failure' => $outcome['failure'],
                ])
                ->log($outcome['status'] === 'sent' ? 'Sent disbursement claim notification' : 'Disbursement claim notification was not delivered');

            return $current->fresh();
        }, attempts: 3);
    }
}
