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
        [$request, $disbursement, $payload] = DB::transaction(function () use ($requestId, $disbursementId, $municipalId, $actorId): array {
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
            if (! in_array($disbursement->notification_status, [null, 'pending', 'failed', 'unavailable'], true)) {
                throw new \DomainException(match ($disbursement->notification_status) {
                    'sending' => 'A claim notification attempt is already in progress.',
                    'submitted' => 'The claim notification was already accepted by Semaphore.',
                    'sent' => 'The claim notification was already sent to the mobile network.',
                    default => 'This claim notification cannot be retried from its current status.',
                });
            }

            $payload = $this->notifier->readyPayload($request, $disbursement);
            $metadata = $disbursement->metadata ?? [];
            if (! is_array($metadata['notifications'] ?? null)) {
                $metadata['notifications'] = [];
            }
            $notificationMetadata = is_array($metadata['notifications']['claim_ready'] ?? null)
                ? $metadata['notifications']['claim_ready']
                : [];
            $metadata['notifications']['claim_ready'] = [
                ...$notificationMetadata,
                'provider' => 'semaphore',
                'submission_started_at' => now()->toIso8601String(),
                'submitted_by_user_id' => $actorId,
            ];
            $disbursement->update([
                'notification_status' => 'sending',
                'notification_phone' => $payload['phone'],
                'notification_message' => $payload['message'],
                'notification_attempts' => $disbursement->notification_attempts + 1,
                'notification_attempted_at' => now(),
                'notification_sent_at' => null,
                'notification_failure' => null,
                'metadata' => $metadata,
            ]);

            return [$request, $disbursement->fresh(), $payload];
        }, attempts: 3);

        $outcome = $this->notifier->ready($request, $disbursement, $payload);

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

            $metadata = $current->metadata ?? [];
            if (! is_array($metadata['notifications'] ?? null)) {
                $metadata['notifications'] = [];
            }
            $notificationMetadata = is_array($metadata['notifications']['claim_ready'] ?? null)
                ? $metadata['notifications']['claim_ready']
                : [];
            $metadata['notifications']['claim_ready'] = [
                ...$notificationMetadata,
                'provider_message_id' => $outcome['provider_message_id'],
                'provider_status' => $outcome['provider_status'],
                'response_recorded_at' => now()->toIso8601String(),
            ];
            $current->update([
                'notification_status' => $outcome['status'],
                'notification_phone' => $outcome['phone'],
                'notification_message' => $outcome['message'],
                'notification_sent_at' => $outcome['status'] === 'sent' ? now() : null,
                'notification_failure' => $outcome['failure'],
                'metadata' => $metadata,
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
                    'provider_message_id' => $outcome['provider_message_id'],
                    'provider_status' => $outcome['provider_status'],
                    'failure' => $outcome['failure'],
                ])
                ->log(match ($outcome['status']) {
                    'sent' => 'Sent disbursement claim notification to the mobile network',
                    'submitted' => 'Submitted disbursement claim notification to Semaphore',
                    default => 'Disbursement claim notification was not submitted',
                });

            return $current->fresh();
        }, attempts: 3);
    }
}
