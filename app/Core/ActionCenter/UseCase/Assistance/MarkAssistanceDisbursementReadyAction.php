<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Services\AssistanceDisbursementService;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class MarkAssistanceDisbursementReadyAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceDisbursementService $disbursements,
        private readonly SendAssistanceDisbursementNotificationAction $notify,
    ) {}

    public function execute(string $requestId, string $disbursementId, string $municipalId, string $actorId): AssistanceDisbursement
    {
        $disbursement = DB::transaction(function () use ($requestId, $disbursementId, $municipalId, $actorId): AssistanceDisbursement {
            $this->lockMunicipality->execute($municipalId);
            $request = $this->lockRequest->execute(
                $requestId,
                $municipalId,
                ['snapshot', 'beneficiary', 'assistanceType', 'documentChecks', 'onBehalfHouseholdMember'],
            );
            $disbursement = AssistanceDisbursement::query()
                ->whereKey($disbursementId)
                ->where('assistance_request_id', $request->id)
                ->lockForUpdate()
                ->firstOrFail();
            if ($disbursement->status !== AssistanceDisbursementStatus::Preparing) {
                throw new \DomainException('Only a disbursement draft can be marked ready.');
            }

            $this->disbursements->assertCurrent($request, $disbursement);
            if ($disbursement->instrument_date->isFuture()) {
                throw new \DomainException('A future-dated check or cash voucher cannot be marked ready for claim.');
            }

            $location = $this->disbursements->resolveClaimLocation($municipalId, $disbursement->claim_location_key);
            $disbursement->update([
                'status' => AssistanceDisbursementStatus::Ready,
                'claim_location_label' => $location['label'],
                'claim_instructions' => $location['instructions'],
                'ready_by_user_id' => $actorId,
                'ready_at' => now(),
                'notification_status' => 'pending',
                'metadata' => [
                    ...($disbursement->metadata ?? []),
                    'claim_location' => $location,
                ],
            ]);

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($actorId))
                ->withProperties([
                    'event' => 'disbursement_ready',
                    'disbursement_id' => $disbursement->id,
                    'attempt_number' => $disbursement->attempt_number,
                    'method' => $disbursement->method->value,
                    'claim_location' => $location,
                ])
                ->log('Marked assistance disbursement ready for claim');

            return $disbursement->fresh();
        }, attempts: 3);

        return $this->notify->execute($requestId, $disbursement->id, $municipalId, $actorId);
    }
}
