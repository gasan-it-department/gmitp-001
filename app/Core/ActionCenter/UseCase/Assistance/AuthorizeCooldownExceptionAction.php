<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AuthorizeCooldownExceptionDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;

final class AuthorizeCooldownExceptionAction
{
    public function __construct(
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceCooldownService $cooldowns,
    ) {}

    public function execute(AuthorizeCooldownExceptionDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto): AssistanceRequest {
            $this->lockMunicipality->execute($dto->municipalId);
            $request = $this->lockRequest->execute(
                $dto->assistanceRequestId,
                $dto->municipalId,
                ['assistanceType', 'beneficiary', 'onBehalfHouseholdMember'],
            );

            if ($request->status !== AssistanceStatus::Approved || $request->hasReleaseArtifacts()) {
                throw new \DomainException('Cooldown exceptions can only be authorized for approved, unreleased requests.');
            }

            $evaluation = $this->cooldowns->evaluate(
                $request->beneficiary,
                $request->assistanceType,
                $request->onBehalfHouseholdMember,
                $dto->releaseDate,
                $request->id,
            );

            if ($evaluation->hasPermanentBlock) {
                throw new \DomainException('A one-time assistance limit cannot be overridden.');
            }

            if (! hash_equals($evaluation->advisory->contextFingerprint, $dto->contextFingerprint)) {
                throw new \DomainException('The cooldown context changed. Refresh the request and review the warning again.');
            }

            if (! $evaluation->advisory->isActive()) {
                throw new \DomainException('No timed cooldown applies on the selected release date, so no exception is needed.');
            }

            $authorization = [
                'reason' => $dto->reason,
                'authorized_by_user_id' => $dto->actorId,
                'authorized_at' => now()->toIso8601String(),
                'release_date_reviewed' => $dto->releaseDate->toDateString(),
                'context_fingerprint' => $evaluation->advisory->contextFingerprint,
                'sources' => $evaluation->advisory->sources,
            ];
            $request->replaceCooldownExceptionAuthorization($authorization);

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->actorId))
                ->withProperties([
                    'event' => 'cooldown_exception_authorized',
                    'reason' => $dto->reason,
                    'release_date_reviewed' => $dto->releaseDate->toDateString(),
                    'cooldown_context' => $evaluation->advisory->toArray(),
                ])
                ->log('Authorized timed cooldown exception');

            return $request->fresh();
        }, attempts: 3);
    }
}
