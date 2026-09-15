<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\ReleaseAssistanceRequestDto;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\AssistanceCooldownService;
use App\Core\ActionCenter\Services\AssistanceMswdVerificationService;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/** Release assistance and start its configured cooldown in one transaction. */
class ReleaseAssistanceRequestAction
{
    private readonly LockActionCenterMunicipalityAction $lockMunicipality;

    private readonly AssistanceCooldownService $cooldowns;

    public function __construct(
        private readonly AssistanceRequestSmsNotifier $smsNotifier,
        private readonly AssistanceMswdVerificationService $mswdVerification,
        ?LockActionCenterMunicipalityAction $lockMunicipality = null,
        ?AssistanceCooldownService $cooldowns = null,
    ) {
        $this->lockMunicipality = $lockMunicipality ?? app(LockActionCenterMunicipalityAction::class);
        $this->cooldowns = $cooldowns ?? app(AssistanceCooldownService::class);
    }

    public function execute(ReleaseAssistanceRequestDto $dto): AssistanceRequest
    {
        $request = DB::transaction(function () use ($dto): AssistanceRequest {
            $this->lockMunicipality->execute($dto->municipalId);
            $relations = ['assistanceType', 'onBehalfHouseholdMember'];
            if (Schema::hasTable('ac_beneficiaries')) {
                $relations[] = 'beneficiary';
            }
            $request = AssistanceRequest::query()
                ->with($relations)
                ->whereKey($dto->assistanceRequestId)
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensureTenantMatch($request, $dto->municipalId);
            $this->ensureTransitionAllowed($request);
            $this->ensureAmountApproved($request);
            $this->mswdVerification->assertCurrent($request);
            $this->ensureReferenceNumberUnique($request, $dto->releaseReferenceNumber);

            $evaluation = Schema::hasTable('ac_beneficiaries') && Schema::hasTable('ac_beneficiary_cooldowns')
                ? $this->cooldowns->evaluate(
                    $request->beneficiary,
                    $request->assistanceType,
                    $request->onBehalfHouseholdMember,
                    $dto->releasedAt,
                    $request->id,
                )
                : null;
            if ($evaluation?->hasPermanentBlock) {
                throw new \DomainException('This one-time assistance has already been released for the applicable person or household.');
            }

            $authorization = data_get($request->metadata, 'cooldown_exception_authorization');
            if ($evaluation?->advisory->isActive()
                && (! is_array($authorization)
                    || ! $this->cooldowns->authorizationCovers(
                        $evaluation->advisory,
                        is_array($authorization['sources'] ?? null) ? $authorization['sources'] : [],
                    ))) {
                throw new \DomainException(
                    'A current timed cooldown requires an explicit decision-maker authorization before release.',
                );
            }

            [$capturedMembers, $capturedBeneficiaryIds] = Schema::hasTable('ac_beneficiaries')
                ? $this->cooldownRecipients($request)
                : [collect(), [$request->beneficiary_id]];
            $metadata = $request->metadata ?? [];
            $metadata['cooldown_policy'] = [
                'type' => $request->assistanceType->cooldown_type,
                'scope' => $request->assistanceType->cooldown_scope,
                'months' => (int) $request->assistanceType->cooldown_months,
                'released_at' => $dto->releasedAt->toIso8601String(),
                'household_id' => $request->household_id,
                'captured_household_member_ids' => $capturedMembers->pluck('id')->values()->all(),
                'captured_beneficiary_ids' => $capturedBeneficiaryIds,
            ];

            $request->update([
                'status' => AssistanceStatus::Released,
                'released_by_user_id' => $dto->cashierId,
                'released_at' => $dto->releasedAt,
                'release_reference_number' => $dto->releaseReferenceNumber,
                'metadata' => $metadata,
                'remarks' => $this->appendReleaseNote(
                    $request->remarks,
                    $dto->releaseReferenceNumber,
                    $dto->releasedAt->toDateString(),
                    $dto->releaseNotes,
                    $dto->cashierName,
                ),
            ]);

            if (Schema::hasTable('ac_beneficiary_cooldowns')) {
                $this->writeCooldowns($request, $dto->releasedAt, $capturedMembers);
            }

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($dto->cashierId))
                ->withProperties([
                    'event' => 'release_cooldown_created',
                    'cooldown_policy' => $metadata['cooldown_policy'],
                ])
                ->log('Started assistance cooldown at physical release');

            return $request->fresh();
        }, attempts: 3);

        $this->smsNotifier->requestReleased($request);

        return $request;
    }

    /** @return array{0: Collection<int, HouseholdMember>, 1: list<string>} */
    private function cooldownRecipients(AssistanceRequest $request): array
    {
        if ($request->assistanceType->cooldown_scope !== 'per_household') {
            return [collect(), [$request->beneficiary_id]];
        }

        $members = HouseholdMember::query()
            ->where('household_id', $request->household_id)
            ->where('is_active', true)
            ->whereNotNull('beneficiary_id')
            ->orderBy('id')
            ->lockForUpdate()
            ->get();
        $beneficiaryIds = $members->pluck('beneficiary_id')->unique()->values()->all();

        if ($members->isEmpty() || ! in_array($request->beneficiary_id, $beneficiaryIds, true)) {
            throw new \DomainException(
                'The household has no valid active linked roster for cooldown capture. Resolve household membership before release.',
            );
        }

        $beneficiaries = Beneficiary::query()
            ->whereIn('id', $beneficiaryIds)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($members as $member) {
            $beneficiary = $beneficiaries->get($member->beneficiary_id);
            if ($beneficiary === null
                || ! $beneficiary->is_active
                || $beneficiary->household_id !== $request->household_id) {
                throw new \DomainException(
                    'An active linked roster member has an inconsistent primary household. Correct the membership before release.',
                );
            }
        }

        return [$members->unique('beneficiary_id')->values(), $beneficiaryIds];
    }

    /** @param Collection<int, HouseholdMember> $capturedMembers */
    private function writeCooldowns(
        AssistanceRequest $request,
        CarbonImmutable $releasedAt,
        Collection $capturedMembers,
    ): void {
        $type = $request->assistanceType;
        $isOneTime = $type->cooldown_type === 'one_time';
        $months = (int) $type->cooldown_months;

        if (! $isOneTime && $months === 0) {
            return;
        }

        $expiresAt = $isOneTime ? null : $releasedAt->addMonthsNoOverflow($months);
        $members = $type->cooldown_scope === 'per_household'
            ? $capturedMembers
            : collect([null]);

        foreach ($members as $member) {
            $beneficiaryId = $member instanceof HouseholdMember
                ? $member->beneficiary_id
                : $request->beneficiary_id;

            BeneficiaryCooldown::query()->updateOrCreate([
                'beneficiary_id' => $beneficiaryId,
                'assistance_type_id' => $request->assistance_type_id,
                'assistance_request_id' => $request->id,
            ], [
                'household_id' => $request->household_id,
                'household_member_id' => $member instanceof HouseholdMember ? $member->id : null,
                'cooldown_starts_at' => $releasedAt,
                'cooldown_expires_at' => $expiresAt,
            ]);
        }
    }

    private function ensureTenantMatch(AssistanceRequest $request, string $municipalId): void
    {
        if ($request->municipal_id !== $municipalId) {
            throw new AuthorizationException('You may only release requests from your own municipality.');
        }
    }

    private function ensureTransitionAllowed(AssistanceRequest $request): void
    {
        if (! $request->status->canTransitionTo(AssistanceStatus::Released)) {
            throw new \DomainException(match ($request->status) {
                AssistanceStatus::Pending => 'This case has not been approved yet and cannot be released.',
                AssistanceStatus::UnderReview => 'This case is still under review and must be approved before release.',
                AssistanceStatus::Released => 'This case has already been released.',
                AssistanceStatus::Rejected => 'This case was rejected and cannot be released.',
                AssistanceStatus::Cancelled => 'This case was cancelled and cannot be released.',
                default => 'This case cannot be released from its current state.',
            });
        }
    }

    private function ensureAmountApproved(AssistanceRequest $request): void
    {
        if ($request->amount_approved === null) {
            throw new \DomainException('This case has no approved amount on file.');
        }
    }

    private function ensureReferenceNumberUnique(AssistanceRequest $request, string $referenceNumber): void
    {
        if (AssistanceRequest::query()
            ->where('municipal_id', $request->municipal_id)
            ->where('release_reference_number', $referenceNumber)
            ->where('id', '!=', $request->id)
            ->exists()) {
            throw new \DomainException(sprintf(
                'Reference number "%s" is already used by another released case.',
                $referenceNumber,
            ));
        }
    }

    private function appendReleaseNote(
        ?string $existing,
        string $referenceNumber,
        string $releasedAt,
        ?string $notes,
        string $cashierName,
    ): string {
        $stamp = sprintf(
            '[RELEASED %s | Encoded %s by %s | Ref: %s]',
            $releasedAt,
            now()->toDateTimeString(),
            $cashierName,
            $referenceNumber,
        );
        $block = $notes !== null ? $stamp."\n".$notes : $stamp;

        return filled($existing) ? rtrim((string) $existing)."\n\n".$block : $block;
    }
}
