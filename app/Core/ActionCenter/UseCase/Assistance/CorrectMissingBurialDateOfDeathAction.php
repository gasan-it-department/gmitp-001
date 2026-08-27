<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\CorrectMissingBurialDateOfDeathDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * Add a missing Date of Death to one approved, unreleased burial request.
 *
 * This is intentionally narrower than ordinary request editing: the request
 * row is locked, the date can only be added while the metadata slot is blank,
 * and the model exposes only this named mutation for the locked states.
 */
class CorrectMissingBurialDateOfDeathAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestFormDefinitionProvider $formDefinitions,
    ) {
    }

    public function execute(CorrectMissingBurialDateOfDeathDto $dto): AssistanceRequest
    {
        return DB::transaction(function () use ($dto): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $dto->assistanceRequestId,
                municipalId: $dto->municipalId,
                with: ['assistanceType'],
            );

            $this->ensureEligibleStatus($request);

            $definition = $this->formDefinitions->for(
                $dto->municipalCode,
                $request->assistanceType?->slug,
            );

            if (! $definition->isDeceasedRequest() || ! $definition->requiresDateOfDeath()) {
                throw new \DomainException(
                    'This assistance program does not use the missing burial Date of Death correction.',
                );
            }

            if ($request->on_behalf_household_member_id === null || $request->relationship_to_beneficiary === null) {
                throw new \DomainException(
                    'This request is not recorded as filed on behalf of an assisted person. Cancel and re-file it correctly instead.',
                );
            }

            $metadata = $request->metadata ?? [];

            if (filled(data_get($metadata, 'on_behalf_date_of_death'))) {
                throw new \DomainException(
                    'This request already has a Date of Death and it cannot be replaced by this correction workflow.',
                );
            }

            $oldDateOfDeath = data_get($metadata, 'on_behalf_date_of_death');
            $dateOfDeath = $this->parseDate($dto->dateOfDeath);
            $this->ensureDateFitsFrozenRecord($request, $metadata, $dateOfDeath);

            $request->addMissingBurialDateOfDeath($dateOfDeath->toDateString());

            $correctedAt = now();

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->correctedByUserId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'attributes' => [
                        'on_behalf_date_of_death' => $dateOfDeath->toDateString(),
                    ],
                    'old' => [
                        'on_behalf_date_of_death' => $oldDateOfDeath,
                    ],
                    'corrected_by_user_id' => $dto->correctedByUserId,
                    'correction_reason' => $dto->reason,
                    'corrected_at' => $correctedAt->toIso8601String(),
                ])
                ->log('Added missing burial Date of Death');

            return $request;
        }, attempts: 3);
    }

    private function ensureEligibleStatus(AssistanceRequest $request): void
    {
        if ($request->status !== AssistanceStatus::Approved) {
            throw new \DomainException(
                'Only an approved, unreleased assistance request can use this correction workflow.',
            );
        }

        if ($request->released_at !== null
            || $request->released_by_user_id !== null
            || $request->release_reference_number !== null) {
            throw new \DomainException(
                'This approved request already contains release data and cannot use the correction workflow until its status is reconciled.',
            );
        }
    }

    private function parseDate(string $value): CarbonImmutable
    {
        try {
            $date = CarbonImmutable::createFromFormat('!Y-m-d', $value, config('app.timezone'));
        } catch (\Throwable) {
            throw new \DomainException('Date of Death must be a valid calendar date.');
        }

        if ($date === false || $date->format('Y-m-d') !== $value) {
            throw new \DomainException('Date of Death must be a valid calendar date.');
        }

        return $date->startOfDay();
    }

    /**
     * Compare only against immutable request data. The current household
     * member record is deliberately not consulted because it may have changed
     * since the assistance request was submitted.
     *
     * @param  array<string, mixed>  $metadata
     */
    private function ensureDateFitsFrozenRecord(
        AssistanceRequest $request,
        array $metadata,
        CarbonImmutable $dateOfDeath,
    ): void {
        if ($request->created_at === null) {
            throw new \DomainException('This request has no submission date, so the correction cannot be validated.');
        }

        if ($dateOfDeath->greaterThan($request->created_at->toImmutable()->startOfDay())) {
            throw new \DomainException('Date of Death cannot be later than the assistance request submission date.');
        }

        $birthDateValue = data_get($metadata, 'on_behalf_birth_date');

        if (blank($birthDateValue)) {
            return;
        }

        $birthDate = $this->parseDate((string) $birthDateValue);

        if ($dateOfDeath->lessThan($birthDate)) {
            throw new \DomainException('Date of Death cannot be earlier than the assisted person\'s recorded birth date.');
        }
    }
}
