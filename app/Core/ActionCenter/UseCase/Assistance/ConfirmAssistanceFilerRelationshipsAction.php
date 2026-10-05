<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Services\AssistanceFilerRelationships;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ConfirmAssistanceFilerRelationshipsAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly ResolveAssistanceRequestHouseholdAction $resolveHousehold,
        private readonly AssistanceFilerRelationships $relationships,
    ) {}

    /** @param array<string, mixed> $answers */
    public function execute(
        string $requestId,
        string $municipalId,
        string $actorId,
        bool $canProcess,
        bool $canCorrect,
        string $expectedFingerprint,
        array $answers,
        ?string $reason,
    ): AssistanceRequest {
        return DB::transaction(function () use (
            $requestId, $municipalId, $actorId, $canProcess, $canCorrect,
            $expectedFingerprint, $answers, $reason,
        ): AssistanceRequest {
            $request = $this->lockRequest->execute($requestId, $municipalId);
            if (! in_array($request->status, [AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)
                || $request->hasReleaseArtifacts()) {
                throw new \DomainException('Relationships can only be confirmed during an unreleased MSWD review.');
            }
            $request->assertNoActiveDisbursement();
            $completed = $request->mswd_verification_status === MswdVerificationStatus::Verified;
            if ($completed) {
                if (! $canCorrect) {
                    throw new AuthorizationException('Completed verification corrections require request correction permission.');
                }
                if (mb_strlen(trim((string) $reason)) < 10 || mb_strlen(trim((string) $reason)) > 1000) {
                    throw new \DomainException('Enter a correction reason of 10 to 1,000 characters.');
                }
            } elseif (! $canProcess || $request->reviewed_by_user_id !== $actorId) {
                throw new AuthorizationException('Only the assigned MSWD reviewer may confirm these relationships.');
            }

            $household = $this->resolveHousehold->execute($request);
            if ($household->usesCurrentFallback) {
                throw new \DomainException('Capture the request household assessment before confirming legacy relationships.');
            }
            $members = $household->members->map->toArray()->all();
            $fingerprint = $this->relationships->fingerprint($members, (string) $request->beneficiary_id);
            if (! hash_equals($fingerprint, $expectedFingerprint)) {
                throw new \DomainException('The saved request roster changed. Refresh the page and review the relationships again.');
            }
            $offRosterAssistedMemberId = $this->relationships->offRosterAssistedMemberId($request, $members);
            $filer = $this->relationships->filerMember($members, (string) $request->beneficiary_id);
            if ($filer === null) {
                throw new \DomainException('The filer must have exactly one linked row in the saved request roster.');
            }
            if ($request->on_behalf_household_member_id !== null
                && ! in_array((string) $request->on_behalf_household_member_id, array_column($members, 'household_member_id'), true)
                && $offRosterAssistedMemberId === null) {
                throw new \DomainException('The assisted person is absent from the assessed roster and cannot be verified against the filing snapshot. Review the request before confirming relationships.');
            }
            if ($filer['is_household_head'] ?? false) {
                throw new \DomainException('The household-head filer relationships come from the saved roster and do not need confirmation.');
            }
            $capture = $this->relationships->capture(
                $members,
                (string) $request->beneficiary_id,
                $answers,
                $actorId,
                $offRosterAssistedMemberId,
            );
            $current = $this->relationships->status($request, $members);
            if ($current['is_confirmed'] && $current['answers'] === $capture['answers']) {
                throw new \DomainException('These filer-relative relationships are already confirmed.');
            }
            $isCorrection = $current['is_confirmed'] || $completed;
            if ($isCorrection && (mb_strlen(trim((string) $reason)) < 10 || mb_strlen(trim((string) $reason)) > 1000)) {
                throw new \DomainException('Enter a correction reason of 10 to 1,000 characters.');
            }
            $capture['confirmed_at'] = now()->toIso8601String();
            $capture['confirmed_by_user_id'] = $actorId;
            $capture['source'] = $isCorrection ? 'mswd_correction' : 'mswd_interview';
            $assisted = $request->on_behalf_household_member_id === null
                ? null
                : ($capture['answers'][(string) $request->on_behalf_household_member_id] ?? null);
            if ($request->on_behalf_household_member_id !== null
                && ! in_array($assisted, Relationship::assistanceRepresentativeValues(), true)) {
                throw new \DomainException('Choose a valid relationship of the assisted person to the filer.');
            }

            $old = data_get($request->metadata, 'filer_relationships');
            $request->replaceFilerRelationships($capture, $assisted);
            if ($completed) {
                $request->updateMswdVerification([
                    'mswd_verification_status' => MswdVerificationStatus::UnderReview,
                    'mswd_verification_notes' => trim((string) $reason),
                    'mswd_verified_by_user_id' => null,
                    'mswd_verified_at' => null,
                    'mswd_verification_fingerprint' => null,
                ]);
            }

            activity('assistance_request')->performedOn($request)->causedBy(User::find($actorId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'old' => ['filer_relationships' => $old],
                    'attributes' => ['filer_relationships' => $capture],
                    'correction_reason' => $isCorrection ? trim((string) $reason) : null,
                ])
                ->log($isCorrection ? 'Corrected filer-relative household relationships' : 'Confirmed filer-relative household relationships');

            return $request->fresh();
        }, attempts: 3);
    }
}
