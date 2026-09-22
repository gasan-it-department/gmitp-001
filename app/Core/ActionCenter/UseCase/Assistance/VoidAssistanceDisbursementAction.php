<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\VoidAssistanceDisbursementDto;
use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Services\AssistanceDisbursementSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class VoidAssistanceDisbursementAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceDisbursementSmsNotifier $notifier,
    ) {}

    public function execute(VoidAssistanceDisbursementDto $dto): AssistanceDisbursement
    {
        [$request, $disbursement, $cancelNotice] = DB::transaction(function () use ($dto): array {
            $this->lockMunicipality->execute($dto->municipalId);
            $request = $this->lockRequest->execute($dto->assistanceRequestId, $dto->municipalId, ['beneficiary']);
            $disbursement = AssistanceDisbursement::query()
                ->whereKey($dto->disbursementId)
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->firstOrFail();
            if (! $disbursement->status->isActive()) {
                throw new \DomainException('Only a preparing or ready disbursement can be voided.');
            }

            if ($disbursement->status === AssistanceDisbursementStatus::Ready
                && $disbursement->notification_status === 'sending'
                && $disbursement->notification_attempted_at?->greaterThan(now()->subMinutes(5))) {
                throw new \DomainException(
                    'A claimant notification is currently being submitted. Wait for it to finish, refresh the request, then void the disbursement.',
                );
            }

            $cancelNotice = $disbursement->status === AssistanceDisbursementStatus::Ready
                && in_array($disbursement->notification_status, ['submitted', 'sent', 'sending'], true);
            $disbursement->update([
                'status' => AssistanceDisbursementStatus::Voided,
                'voided_by_user_id' => $dto->actorId,
                'voided_at' => now(),
                'void_reason' => $dto->reason,
            ]);

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'event' => 'disbursement_voided',
                    'disbursement_id' => $disbursement->id,
                    'attempt_number' => $disbursement->attempt_number,
                    'reason' => $dto->reason,
                ])
                ->log('Voided assistance disbursement');

            return [$request, $disbursement->fresh(), $cancelNotice];
        }, attempts: 3);

        if ($cancelNotice) {
            $outcome = $this->notifier->voided($request, $disbursement);
            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'event' => 'disbursement_void_notification',
                    'disbursement_id' => $disbursement->id,
                    'notification_status' => $outcome['status'],
                    'notification_phone' => $outcome['phone'],
                    'provider_message_id' => $outcome['provider_message_id'] ?? null,
                    'provider_status' => $outcome['provider_status'] ?? null,
                    'failure' => $outcome['failure'],
                ])
                ->log(match ($outcome['status']) {
                    'sent' => 'Sent cancelled claim notice to the mobile network',
                    'submitted' => 'Submitted cancelled claim notice to Semaphore',
                    default => 'Cancelled claim notice was not submitted',
                });
        }

        return $disbursement;
    }
}
