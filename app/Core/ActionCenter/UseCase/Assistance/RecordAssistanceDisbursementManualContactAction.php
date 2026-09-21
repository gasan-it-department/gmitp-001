<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class RecordAssistanceDisbursementManualContactAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly LockAssistanceRequestAction $lockRequest,
    ) {}

    public function execute(
        string $requestId,
        string $disbursementId,
        string $municipalId,
        string $actorId,
        string $channel,
        string $note,
    ): AssistanceDisbursement {
        return DB::transaction(function () use ($requestId, $disbursementId, $municipalId, $actorId, $channel, $note): AssistanceDisbursement {
            $this->lockMunicipality->execute($municipalId);
            $request = $this->lockRequest->execute($requestId, $municipalId);
            $disbursement = AssistanceDisbursement::query()
                ->whereKey($disbursementId)
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->firstOrFail();
            if ($disbursement->status !== AssistanceDisbursementStatus::Ready) {
                throw new \DomainException('Manual claimant contact can only be recorded while the disbursement is ready.');
            }
            if ($disbursement->notification_status === 'sent') {
                throw new \DomainException('The claimant was already notified successfully by SMS.');
            }

            $metadata = $disbursement->metadata ?? [];
            $metadata['manual_contacts'][] = [
                'channel' => $channel,
                'note' => $note,
                'actor_id' => $actorId,
                'recorded_at' => now()->toIso8601String(),
            ];
            $disbursement->update(['metadata' => $metadata]);

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($actorId))
                ->withProperties([
                    'event' => 'disbursement_manual_contact',
                    'disbursement_id' => $disbursement->id,
                    'channel' => $channel,
                    'note' => $note,
                ])
                ->log('Recorded manual disbursement claim contact');

            return $disbursement->fresh();
        }, attempts: 3);
    }
}
