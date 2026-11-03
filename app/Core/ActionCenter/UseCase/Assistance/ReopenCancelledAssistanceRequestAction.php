<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReopenCancelledAssistanceRequestDto;
use App\Core\ActionCenter\Models\AssistanceDisbursement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\Services\CancelledAssistanceRecoveryService;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

final class ReopenCancelledAssistanceRequestAction
{
    public function __construct(private LockActionCenterMunicipalityAction $municipality, private LockAssistanceRequestAction $requests,
        private CancelledAssistanceRecoveryService $recovery, private AssistanceRequestSmsNotifier $sms) {}

    public function execute(ReopenCancelledAssistanceRequestDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto) {
            $this->municipality->execute($dto->municipalId);
            $actor = User::findOrFail($dto->actorId);
            if (! $actor->can('action_center.requests.decide') || ! $actor->can('action_center.requests.correct')) {
                throw new AuthorizationException;
            }
            $request = $this->requests->execute(id: $dto->requestId, municipalId: $dto->municipalId);
            $reason = trim($dto->reason);
            if (mb_strlen($reason) < 10 || mb_strlen($reason) > 1000 || ! $dto->confirmNotReleased || ! $dto->confirmPapersInvalid
                || $dto->operationKey === '' || strlen($dto->operationKey) > 100) {
                throw new \DomainException('A valid reason, operation key and both confirmations are required.');
            }
            $inputHash = hash('sha256', json_encode([$dto->actorId, $reason, $dto->contextToken], JSON_THROW_ON_ERROR));
            $metadata = $request->metadata ?? [];
            foreach ($metadata['reopen_history'] ?? [] as $event) {
                if ($event['operation_key'] === $dto->operationKey) {
                    if (! hash_equals($event['input_hash'], $inputHash)) {
                        throw new \DomainException('This operation key has already been used with different input.');
                    }

                    return $request;
                }
            }
            if (! hash_equals($this->recovery->token($request), $dto->contextToken)) {
                throw new \DomainException('The cancellation changed. Refresh and review this request again.');
            }
            if (Schema::hasTable('ac_assistance_disbursements')) {
                AssistanceDisbursement::query()->where('assistance_request_id', $request->id)->orderBy('id')->lockForUpdate()->get();
            }
            if ($blocker = $this->recovery->blocker($request)) {
                throw new \DomainException($blocker);
            }
            $event = [
                'operation_key' => $dto->operationKey, 'input_hash' => $inputHash,
                'approved_amount' => $request->amount_approved, 'approved_by_user_id' => $request->approved_by_user_id,
                'approved_by_name' => $request->approvedBy?->full_name, 'cancelled_by_name' => $request->cancelledBy?->full_name,
                'approved_at' => $request->approved_at?->toIso8601String(), 'cancelled_at' => $request->cancelled_at?->toIso8601String(),
                'cancelled_by_user_id' => $request->cancelled_by_user_id, 'reopened_at' => now()->toIso8601String(),
                'reopened_by_user_id' => $actor->id, 'reopened_by_name' => $actor->full_name, 'reason' => $reason,
            ];
            $metadata['reopen_history'][] = $event;
            unset($metadata['cooldown_exception_authorization']);
            $request->reopenCancelledForReview($metadata, rtrim($request->remarks ?? '')."\n\n[REOPENED FOR REVIEW ".$event['reopened_at'].' by '.$actor->full_name."]\n".$reason);
            activity('assistance_request')->performedOn($request)->causedBy($actor)->withProperties(['municipal_id' => $dto->municipalId, ...$event])->log('Reopened cancelled assistance request for review');
            DB::afterCommit(fn () => $this->sms->requestReopened($request));

            return $request->fresh();
        }, attempts: 3);
    }
}
