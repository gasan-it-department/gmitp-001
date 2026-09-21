<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\SaveAssistanceDisbursementDto;
use App\Core\ActionCenter\Enums\AssistanceDisbursementMethod;
use App\Core\ActionCenter\Enums\AssistanceDisbursementStatus;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Services\AssistanceDisbursementService;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

class SaveAssistanceDisbursementAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceDisbursementService $disbursements,
    ) {}

    public function execute(SaveAssistanceDisbursementDto $dto): AssistanceDisbursement
    {
        return DB::transaction(function () use ($dto): AssistanceDisbursement {
            $this->lockMunicipality->execute($dto->municipalId);
            $request = $this->lockRequest->execute(
                $dto->assistanceRequestId,
                $dto->municipalId,
                ['snapshot', 'beneficiary', 'assistanceType', 'documentChecks', 'onBehalfHouseholdMember'],
            );
            $this->disbursements->assertRequestCanPrepare($request);

            $method = AssistanceDisbursementMethod::from($dto->method);
            $location = $this->disbursements->resolveClaimLocation($dto->municipalId, $dto->claimLocationKey);
            $active = AssistanceDisbursement::query()
                ->where('assistance_request_id', $request->id)
                ->whereIn('status', [
                    AssistanceDisbursementStatus::Preparing->value,
                    AssistanceDisbursementStatus::Ready->value,
                ])
                ->lockForUpdate()
                ->first();

            if ($active?->status === AssistanceDisbursementStatus::Ready) {
                throw new \DomainException('The ready disbursement is locked. Void it before preparing a replacement.');
            }

            $duplicate = AssistanceDisbursement::query()
                ->where('municipal_id', $dto->municipalId)
                ->where('method', $method->value)
                ->where('instrument_reference_number', $dto->instrumentReferenceNumber)
                ->where('status', '!=', AssistanceDisbursementStatus::Voided->value)
                ->when($active, fn ($query) => $query->whereKeyNot($active->id))
                ->exists();
            if ($duplicate) {
                throw new \DomainException('That check or cash-voucher reference is already recorded.');
            }

            $attributes = [
                'municipal_id' => $dto->municipalId,
                'assistance_request_id' => $request->id,
                'method' => $method,
                'status' => AssistanceDisbursementStatus::Preparing,
                'amount' => $request->amount_approved,
                'payee_name' => $this->disbursements->payeeName($request),
                'instrument_reference_number' => $dto->instrumentReferenceNumber,
                'instrument_date' => $dto->instrumentDate,
                'claim_location_key' => $location['key'],
                'claim_location_label' => $location['label'],
                'claim_instructions' => $location['instructions'],
                'source_fingerprint' => $this->disbursements->fingerprint($request),
                'preparation_notes' => $dto->notes,
                'prepared_by_user_id' => $dto->actorId,
                'prepared_at' => now(),
                'metadata' => [
                    'claim_location' => $location,
                ],
            ];

            $old = $active?->only([
                'method',
                'instrument_reference_number',
                'instrument_date',
                'claim_location_key',
                'preparation_notes',
            ]);

            if ($active === null) {
                $lastAttempt = AssistanceDisbursement::query()
                    ->where('assistance_request_id', $request->id)
                    ->orderByDesc('attempt_number')
                    ->lockForUpdate()
                    ->first();
                $attributes['attempt_number'] = ((int) ($lastAttempt?->attempt_number ?? 0)) + 1;
                $active = AssistanceDisbursement::query()->create($attributes);
            } else {
                $active->update($attributes);
            }

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'event' => $old === null ? 'disbursement_prepared' : 'disbursement_draft_updated',
                    'disbursement_id' => $active->id,
                    'attempt_number' => $active->attempt_number,
                    'old' => $old,
                    'attributes' => $active->only([
                        'method',
                        'instrument_reference_number',
                        'instrument_date',
                        'claim_location_key',
                        'preparation_notes',
                    ]),
                ])
                ->log($old === null ? 'Prepared assistance disbursement' : 'Updated assistance disbursement draft');

            return $active->fresh(['preparedBy']);
        }, attempts: 3);
    }
}
