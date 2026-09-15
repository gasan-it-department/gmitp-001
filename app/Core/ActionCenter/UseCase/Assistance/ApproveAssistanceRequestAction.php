<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\ApproveAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestFormDefinition;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Exceptions\AssistanceApprovalException;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Record the authorized amount. Cooldown rows are created only at release. */
class ApproveAssistanceRequestAction
{
    private readonly LockActionCenterMunicipalityAction $lockMunicipality;

    private readonly AssistanceCooldownService $cooldowns;

    public function __construct(
        protected LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestSmsNotifier $smsNotifier,
        private readonly AssistanceRequestFormDefinitionProvider $formDefinitions,
        ?LockActionCenterMunicipalityAction $lockMunicipality = null,
        ?AssistanceCooldownService $cooldowns = null,
    ) {
        $this->lockMunicipality = $lockMunicipality ?? app(LockActionCenterMunicipalityAction::class);
        $this->cooldowns = $cooldowns ?? app(AssistanceCooldownService::class);
    }

    public function execute(ApproveAssistanceRequestDto $dto): AssistanceRequest
    {
        $request = DB::transaction(function () use ($dto): AssistanceRequest {
            $this->lockMunicipality->execute($dto->municipalId);
            $relations = ['assistanceType.documents', 'onBehalfHouseholdMember'];
            if (Schema::hasTable('ac_beneficiaries')) {
                $relations[] = 'beneficiary';
            }

            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: $relations,
            );

            $this->ensureTransitionAllowed($request);
            $definition = $this->formDefinitions->for($dto->municipalCode, $request->assistanceType?->slug);
            $this->ensureConfiguredRequestFieldsReady($request, $definition);
            $this->ensureAmountWithinLimits($request, $dto->amountApproved);

            $evaluation = Schema::hasTable('ac_beneficiaries') && Schema::hasTable('ac_beneficiary_cooldowns')
                ? $this->cooldowns->evaluate(
                    $request->beneficiary,
                    $request->assistanceType,
                    $request->onBehalfHouseholdMember,
                    excludeRequestId: $request->id,
                )
                : null;

            if ($evaluation?->hasPermanentBlock) {
                throw new \DomainException('This one-time assistance has already been released for the applicable person or household.');
            }

            if ($evaluation !== null
                && ! hash_equals($evaluation->advisory->contextFingerprint, $dto->cooldownContextFingerprint)) {
                throw new \DomainException('The cooldown context changed. Refresh the request and review the current warning before recording the amount.');
            }

            $metadata = $request->metadata ?? [];
            if ($evaluation?->advisory->isActive()) {
                if ($dto->cooldownExceptionReason === null) {
                    throw new \DomainException('A cooldown exception reason of at least 10 characters is required.');
                }

                $metadata['cooldown_exception_authorization'] = [
                    'reason' => $dto->cooldownExceptionReason,
                    'authorized_by_user_id' => $dto->approverId,
                    'authorized_at' => now()->toIso8601String(),
                    'context_fingerprint' => $evaluation->advisory->contextFingerprint,
                    'sources' => $evaluation->advisory->sources,
                ];
            } else {
                unset($metadata['cooldown_exception_authorization']);
            }

            $request->update([
                'status' => AssistanceStatus::Approved,
                'amount_approved' => $dto->amountApproved,
                'approved_by_user_id' => $dto->approverId,
                'approved_at' => now(),
                'metadata' => $metadata !== [] ? $metadata : null,
                'remarks' => $this->appendApprovalNotes(
                    $request->remarks,
                    $dto->approvalNotes,
                    $dto->approverId,
                ),
            ]);

            if ($evaluation?->advisory->isActive()) {
                activity('assistance_request')
                    ->performedOn($request)
                    ->causedBy(User::find($dto->approverId))
                    ->withProperties([
                        'event' => 'cooldown_exception_authorized',
                        'reason' => $dto->cooldownExceptionReason,
                        'cooldown_context' => $evaluation->advisory->toArray(),
                    ])
                    ->log('Authorized timed cooldown exception');
            }

            return $request->fresh();
        }, attempts: 3);

        $this->smsNotifier->requestApproved($request);

        return $request;
    }

    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (! $request->status->canTransitionTo(AssistanceStatus::Approved)) {
            throw AssistanceApprovalException::invalidTransition($request->status);
        }
    }

    private function ensureConfiguredRequestFieldsReady(
        AssistanceRequest $request,
        AssistanceRequestFormDefinition $definition,
    ): void {
        if ($definition->requiresDateOfDeath()
            && blank(data_get($request->metadata, 'on_behalf_date_of_death'))) {
            throw AssistanceApprovalException::missingDateOfDeath();
        }
    }

    private function ensureAmountWithinLimits(AssistanceRequest $request, float $amount): void
    {
        $type = $request->assistanceType;

        if ($type->min_amount !== null && $amount < (float) $type->min_amount) {
            throw AssistanceApprovalException::amountBelowMinimum((float) $type->min_amount);
        }

        if ($type->max_amount !== null && $amount > (float) $type->max_amount) {
            throw AssistanceApprovalException::amountAboveMaximum((float) $type->max_amount);
        }
    }

    private function appendApprovalNotes(?string $existing, string $notes, string $approverId): string
    {
        $user = User::find($approverId);
        $name = $user
            ? (trim("{$user->first_name} {$user->last_name}") ?: ($user->user_name ?? $approverId))
            : $approverId;
        $block = '[APPROVED '.now()->toDateTimeString().' by '.$name."]\n".$notes;

        return filled($existing) ? rtrim((string) $existing)."\n\n".$block : $block;
    }
}
