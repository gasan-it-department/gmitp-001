<?php

namespace App\Core\ActionCenter\Services;

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Enums\AssistanceRequestDocumentCheckStatus;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\Enums\PhysicalCopyRequirement;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceRequestDocumentCheck;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * Owns the request-level MSWD checklist and verification lifecycle.
 *
 * Financial approval is deliberately absent here. A Mayor-authorized amount
 * can be recorded before or after this review, while release and financial
 * document generation call assertCurrent() as their final safety gate.
 */
class AssistanceMswdVerificationService
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
        private readonly AssistanceRequestFormDefinitionProvider $formDefinitions,
    ) {}

    /**
     * Freeze the currently configured document requirements for a newly filed
     * request or the controlled rollout baseline. This method intentionally
     * does not overwrite an existing captured list.
     */
    public function captureRequirements(AssistanceRequest $request): void
    {
        if ($request->document_requirements_captured_at !== null) {
            return;
        }

        $request->loadMissing('assistanceType.documents');
        $requirements = $request->assistanceType?->documents ?? collect();

        foreach ($requirements as $document) {
            [$isApplicable, $exemptionReason, $isRequired] = $this->applicability(
                request: $request,
                documentKey: (string) $document->key,
                configuredRequired: (bool) $document->pivot->is_required,
            );

            AssistanceRequestDocumentCheck::query()->firstOrCreate(
                [
                    'assistance_request_id' => $request->id,
                    'document_key' => $document->key,
                ],
                [
                    'label' => $document->label,
                    'description' => $document->description,
                    'is_required' => $isRequired,
                    'physical_copy_requirement' => PhysicalCopyRequirement::tryFrom(
                        (string) ($document->pivot->physical_copy_requirement ?? ''),
                    ) ?? PhysicalCopyRequirement::Unspecified,
                    'sort_order' => (int) ($document->pivot->sort_order ?? 0),
                    'is_applicable' => $isApplicable,
                    'exemption_reason' => $exemptionReason,
                    'verification_status' => AssistanceRequestDocumentCheckStatus::Pending,
                ],
            );
        }

        $request->updateMswdVerification([
            'document_requirements_captured_at' => now(),
            'mswd_verification_status' => $request->mswd_verification_status
                ?? MswdVerificationStatus::Pending,
        ]);
    }

    /** Pick up or resume MSWD review and assign its reviewer under lock. */
    public function start(string $assistanceRequestId, string $municipalId, string $reviewerId): AssistanceRequest
    {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $reviewerId): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $assistanceRequestId,
                municipalId: $municipalId,
                with: ['assistanceType.documents', 'documentChecks'],
            );

            $this->assertReviewerCanVerify($reviewerId, $municipalId);
            $this->assertOpenAndUnreleased($request);

            if (! in_array($request->status, [AssistanceStatus::Pending, AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)) {
                throw new \DomainException('This request cannot be started for MSWD review from its current status.');
            }

            if ($request->reviewed_by_user_id !== null && $request->reviewed_by_user_id !== $reviewerId) {
                throw new \DomainException('This case is already assigned to another MSWD reviewer.');
            }

            if ($request->mswd_verification_status === MswdVerificationStatus::UnderReview) {
                throw new \DomainException('MSWD review is already active for the assigned reviewer.');
            }

            if ($request->mswd_verification_status === MswdVerificationStatus::Verified) {
                throw new \DomainException('This request has already completed MSWD verification.');
            }

            $this->captureRequirements($request);

            if ($request->status === AssistanceStatus::Pending) {
                $request->update([
                    'status' => AssistanceStatus::UnderReview,
                    'reviewed_by_user_id' => $reviewerId,
                    'reviewed_at' => now(),
                ]);
            } else {
                $request->updateMswdVerification([
                    'reviewed_by_user_id' => $reviewerId,
                    'reviewed_at' => $request->reviewed_at ?? now(),
                ]);
            }

            $request->updateMswdVerification([
                'mswd_verification_status' => MswdVerificationStatus::UnderReview,
                'mswd_verification_notes' => null,
                'mswd_verified_by_user_id' => null,
                'mswd_verified_at' => null,
                'mswd_verification_fingerprint' => null,
            ]);

            $this->recordActivity($request, $reviewerId, 'Started MSWD verification');

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    /** @param array{status:string,media_id:?int,media_version:?string,presented_copy_type:PhysicalCopyRequirement|string|null,physical_inspected:bool,remarks:?string} $input */
    public function updateDocumentCheck(
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
        string $documentKey,
        array $input,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actorId, $documentKey, $input): AssistanceRequest {
            $request = $this->lockedRequestForAssessment($assistanceRequestId, $municipalId);
            $this->assertAssignedReviewer($request, $actorId, $municipalId);

            if ($request->mswd_verification_status !== MswdVerificationStatus::UnderReview) {
                throw new \DomainException('Start or resume MSWD review before recording document checks.');
            }

            $check = $request->documentChecks->firstWhere('document_key', $documentKey);
            if (! $check instanceof AssistanceRequestDocumentCheck) {
                throw new \DomainException('This document is not part of the frozen request checklist.');
            }
            if (! $check->is_applicable) {
                throw new \DomainException('This document is not applicable to this request.');
            }

            $status = AssistanceRequestDocumentCheckStatus::tryFrom((string) $input['status']);
            if ($status === null) {
                throw new \DomainException('Choose a valid document verification outcome.');
            }
            $presentedCopyType = $this->presentedCopyType($input['presented_copy_type'] ?? null);

            $media = $this->resolveCurrentRequestMedia($request, $documentKey, $input['media_id'] ?? null);
            if ($status === AssistanceRequestDocumentCheckStatus::Verified) {
                if (! $media instanceof Media) {
                    throw new \DomainException('Upload the current document scan before accepting it.');
                }
                if (! hash_equals($this->mediaVersion($media), (string) ($input['media_version'] ?? ''))) {
                    throw new \DomainException('The document scan changed while you were checking it. Refresh the request and inspect the current file.');
                }
                if (! ($input['physical_inspected'] ?? false)) {
                    throw new \DomainException('Confirm that you inspected the physical document before accepting it.');
                }
                $this->assertCopyTypeAccepted($check, $presentedCopyType);
            }

            $remarks = trim((string) ($input['remarks'] ?? ''));
            if ($status === AssistanceRequestDocumentCheckStatus::NeedsCorrection && mb_strlen($remarks) < 10) {
                throw new \DomainException('Explain the document correction needed in at least 10 characters.');
            }

            $old = $check->only([
                'verification_status', 'inspected_media_id', 'inspected_media_version',
                'presented_copy_type', 'remarks', 'checked_by_user_id', 'checked_at',
            ]);
            $check->update([
                'verification_status' => $status,
                'inspected_media_id' => $status === AssistanceRequestDocumentCheckStatus::Verified ? $media?->id : null,
                'inspected_media_version' => $status === AssistanceRequestDocumentCheckStatus::Verified ? $this->mediaVersion($media) : null,
                'presented_copy_type' => $status === AssistanceRequestDocumentCheckStatus::Verified ? $presentedCopyType : null,
                'remarks' => $remarks !== '' ? $remarks : null,
                'checked_by_user_id' => $actorId,
                'checked_at' => now(),
            ]);
            $this->invalidateCurrentVerification($request, null);

            $this->recordActivity($request, $actorId, 'Recorded MSWD document check', [
                'document_key' => $documentKey,
                'old' => $old,
                'attributes' => $check->fresh()->only([
                    'verification_status', 'inspected_media_id', 'inspected_media_version',
                    'presented_copy_type', 'remarks', 'checked_by_user_id', 'checked_at',
                ]),
            ]);

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    /** Complete the independent MSWD assessment after all server checks pass. */
    public function complete(
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
        string $expectedFingerprint,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actorId, $expectedFingerprint): AssistanceRequest {
            $request = $this->lockedRequestForAssessment($assistanceRequestId, $municipalId);
            $this->assertAssignedReviewer($request, $actorId, $municipalId);

            if ($request->mswd_verification_status !== MswdVerificationStatus::UnderReview) {
                throw new \DomainException('Start or resume MSWD review before completing verification.');
            }

            $blockers = $this->readinessBlockers($request);
            if ($blockers !== []) {
                throw new \DomainException('MSWD verification cannot be completed: '.implode(' ', $blockers));
            }

            $fingerprint = $this->verificationFingerprint($request);
            if (! hash_equals($fingerprint, $expectedFingerprint)) {
                throw new \DomainException('The case changed while you were reviewing it. Refresh the request and confirm the current evidence.');
            }

            $request->updateMswdVerification([
                'mswd_verification_status' => MswdVerificationStatus::Verified,
                'mswd_verified_by_user_id' => $actorId,
                'mswd_verified_at' => now(),
                'mswd_verification_notes' => null,
                'mswd_verification_fingerprint' => $fingerprint,
            ]);

            $this->recordActivity($request, $actorId, 'Completed MSWD verification', [
                'verification_fingerprint' => $fingerprint,
            ]);

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    public function returnForCorrection(
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
        string $reason,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actorId, $reason): AssistanceRequest {
            $request = $this->lockedRequestForAssessment($assistanceRequestId, $municipalId);
            $this->assertAssignedReviewer($request, $actorId, $municipalId);
            $this->assertReason($reason);

            if (! in_array($request->mswd_verification_status, [MswdVerificationStatus::UnderReview, MswdVerificationStatus::Pending], true)) {
                throw new \DomainException('This verification cannot be returned for correction from its current state.');
            }

            $request->updateMswdVerification([
                'mswd_verification_status' => MswdVerificationStatus::NeedsCorrection,
                'mswd_verification_notes' => trim($reason),
                'mswd_verified_by_user_id' => null,
                'mswd_verified_at' => null,
                'mswd_verification_fingerprint' => null,
            ]);
            $this->recordActivity($request, $actorId, 'Returned MSWD verification for correction', ['reason' => trim($reason)]);

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    public function reopen(
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
        string $reason,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actorId, $reason): AssistanceRequest {
            $request = $this->lockedRequestForAssessment($assistanceRequestId, $municipalId);
            $this->assertActorCanCorrect($actorId, $municipalId);
            $this->assertReason($reason);
            $this->assertOpenAndUnreleased($request);

            if ($request->mswd_verification_status !== MswdVerificationStatus::Verified) {
                throw new \DomainException('Only a completed MSWD verification can be reopened.');
            }

            $request->updateMswdVerification([
                'mswd_verification_status' => MswdVerificationStatus::UnderReview,
                'mswd_verification_notes' => trim($reason),
                'mswd_verified_by_user_id' => null,
                'mswd_verified_at' => null,
                'mswd_verification_fingerprint' => null,
            ]);
            $this->recordActivity($request, $actorId, 'Reopened MSWD verification', ['reason' => trim($reason)]);

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    public function reassign(
        string $assistanceRequestId,
        string $municipalId,
        string $actorId,
        string $reviewerId,
        string $reason,
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actorId, $reviewerId, $reason): AssistanceRequest {
            $request = $this->lockedRequestForAssessment($assistanceRequestId, $municipalId);
            $this->assertActorCanCorrect($actorId, $municipalId);
            $this->assertReviewerCanVerify($reviewerId, $municipalId);
            $this->assertReason($reason);
            $this->assertOpenAndUnreleased($request);

            if ($request->mswd_verification_status === MswdVerificationStatus::Verified) {
                throw new \DomainException('Reopen the completed verification before assigning another reviewer.');
            }

            $oldReviewerId = $request->reviewed_by_user_id;
            $request->updateMswdVerification([
                'reviewed_by_user_id' => $reviewerId,
                'reviewed_at' => now(),
                'mswd_verification_status' => MswdVerificationStatus::UnderReview,
                'mswd_verification_notes' => trim($reason),
                'mswd_verified_by_user_id' => null,
                'mswd_verified_at' => null,
                'mswd_verification_fingerprint' => null,
            ]);
            $this->recordActivity($request, $actorId, 'Reassigned MSWD reviewer', [
                'old_reviewer_id' => $oldReviewerId,
                'new_reviewer_id' => $reviewerId,
                'reason' => trim($reason),
            ]);

            return $this->freshRequest($request);
        }, attempts: 3);
    }

    /**
     * The final financial/release gate. A released legacy record with NULL
     * MSWD state remains printable because this rollout cannot fabricate its
     * paper verification history.
     */
    public function assertCurrent(AssistanceRequest $request): void
    {
        if ($request->status === AssistanceStatus::Released && $request->mswd_verification_status === null) {
            return;
        }

        if ($request->mswd_verification_status !== MswdVerificationStatus::Verified) {
            throw new \DomainException('MSWD verification must be completed before this request can proceed to financial documents or release.');
        }
        if (blank($request->mswd_verification_fingerprint)) {
            throw new \DomainException('The completed MSWD verification has no current evidence fingerprint. Reopen and verify the request again.');
        }

        // Do not load identity media, household relations, and every document
        // check until the inexpensive lifecycle gate has already passed.
        $this->loadVerificationRelations($request);

        $blockers = $this->readinessBlockers($request);
        if ($blockers !== []) {
            throw new \DomainException('MSWD verification is no longer current: '.implode(' ', $blockers));
        }

        $current = $this->verificationFingerprint($request);
        if (! hash_equals((string) $request->mswd_verification_fingerprint, $current)) {
            throw new \DomainException('MSWD verification is outdated because the assessed evidence changed. Reopen and verify the request again.');
        }
    }

    /** @return array{status:?string,is_current:bool,blockers:list<string>,fingerprint:?string,notes:?string,verified_at:?string,verified_by:?array{id:string,name:string}} */
    public function payload(AssistanceRequest $request): array
    {
        $this->loadVerificationRelations($request);
        $status = $request->mswd_verification_status;
        $blockers = $this->readinessBlockers($request);
        $fingerprint = $request->document_requirements_captured_at !== null
            ? $this->verificationFingerprint($request)
            : null;
        $isCurrent = $status === MswdVerificationStatus::Verified
            && $fingerprint !== null
            && filled($request->mswd_verification_fingerprint)
            && hash_equals((string) $request->mswd_verification_fingerprint, $fingerprint)
            && $blockers === [];

        return [
            'status' => $status?->value,
            'is_current' => $isCurrent,
            'blockers' => $blockers,
            'fingerprint' => $fingerprint,
            'notes' => $request->mswd_verification_notes,
            'verified_at' => $request->mswd_verified_at?->toIso8601String(),
            'verified_by' => $request->mswdVerifiedBy ? $this->actorPayload($request->mswdVerifiedBy) : null,
        ];
    }

    /** @return list<array<string, mixed>> */
    public function documentChecksPayload(AssistanceRequest $request): array
    {
        $this->loadVerificationRelations($request);

        return $request->documentChecks->map(function (AssistanceRequestDocumentCheck $check) use ($request): array {
            $media = $this->resolveCurrentRequestMedia($request, $check->document_key, null);

            return [
                'id' => $check->id,
                'document_key' => $check->document_key,
                'label' => $check->label,
                'description' => $check->description,
                'is_required' => $check->is_required,
                'is_applicable' => $check->is_applicable,
                'exemption_reason' => $check->exemption_reason,
                'physical_copy_requirement' => ($check->physical_copy_requirement ?? PhysicalCopyRequirement::Unspecified)->value,
                'verification_status' => ($check->verification_status ?? AssistanceRequestDocumentCheckStatus::Pending)->value,
                'presented_copy_type' => $check->presented_copy_type?->value,
                'remarks' => $check->remarks,
                'checked_by' => $check->checkedBy ? $this->actorPayload($check->checkedBy) : null,
                'checked_at' => $check->checked_at?->toIso8601String(),
                'media_id' => $media?->id,
                'media_version' => $media ? $this->mediaVersion($media) : null,
            ];
        })->values()->all();
    }

    /** Reset a stale check after its underlying scan has been replaced. */
    public function resetCheckForReplacement(AssistanceRequest $request, string $documentKey): void
    {
        $check = AssistanceRequestDocumentCheck::query()
            ->where('assistance_request_id', $request->id)
            ->where('document_key', $documentKey)
            ->lockForUpdate()
            ->first();

        if (! $check instanceof AssistanceRequestDocumentCheck) {
            throw new \DomainException('This upload does not belong to the frozen request checklist.');
        }

        $check->update([
            'verification_status' => AssistanceRequestDocumentCheckStatus::Pending,
            'inspected_media_id' => null,
            'inspected_media_version' => null,
            'presented_copy_type' => null,
            'remarks' => null,
            'checked_by_user_id' => null,
            'checked_at' => null,
        ]);
        $this->invalidateCurrentVerification($request, null);
    }

    public function canContinueAssessment(AssistanceRequest $request): bool
    {
        return in_array($request->status, [AssistanceStatus::Pending, AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)
            && ! $this->hasReleaseArtifacts($request)
            && $request->mswd_verification_status !== MswdVerificationStatus::Verified;
    }

    private function lockedRequestForAssessment(string $id, string $municipalId): AssistanceRequest
    {
        $request = $this->lockRequest->execute(
            id: $id,
            municipalId: $municipalId,
            with: [
                'assistanceType.documents',
                'snapshot',
                'beneficiary.media',
                'onBehalfHouseholdMember',
                'media',
                'documentChecks.checkedBy',
                'mswdVerifiedBy',
            ],
        );
        $this->captureRequirements($request);
        $request->load('documentChecks.checkedBy');

        return $request;
    }

    private function loadVerificationRelations(AssistanceRequest $request): void
    {
        $request->loadMissing([
            'assistanceType.documents',
            'snapshot',
            'beneficiary.media',
            'onBehalfHouseholdMember',
            'media',
            'documentChecks.checkedBy',
            'mswdVerifiedBy',
        ]);
    }

    private function freshRequest(AssistanceRequest $request): AssistanceRequest
    {
        return $request->fresh([
            'assistanceType.documents',
            'snapshot',
            'beneficiary.media',
            'onBehalfHouseholdMember',
            'media',
            'documentChecks.checkedBy',
            'mswdVerifiedBy',
        ]);
    }

    private function assertAssignedReviewer(AssistanceRequest $request, string $actorId, string $municipalId): void
    {
        $this->assertReviewerCanVerify($actorId, $municipalId);
        $this->assertOpenAndUnreleased($request);

        if ($request->reviewed_by_user_id !== $actorId) {
            throw new AuthorizationException('Only the MSWD reviewer assigned to this case may record verification decisions.');
        }
    }

    private function assertReviewerCanVerify(string $actorId, string $municipalId): void
    {
        $actor = User::query()->whereKey($actorId)->first();
        if (! $actor || (! $this->canActInMunicipality($actor, $municipalId))
            || ! $actor->can(EnumPermissions::ACTION_CENTER_REQUESTS_VERIFY->value)) {
            throw new AuthorizationException('This user is not an eligible MSWD request verifier for this municipality.');
        }
    }

    private function assertActorCanCorrect(string $actorId, string $municipalId): void
    {
        $actor = User::query()->whereKey($actorId)->first();
        if (! $actor || (! $this->canActInMunicipality($actor, $municipalId))
            || ! $actor->can(EnumPermissions::ACTION_CENTER_REQUESTS_CORRECT->value)) {
            throw new AuthorizationException('This user is not authorized to correct MSWD verification records.');
        }
    }

    private function canActInMunicipality(User $user, string $municipalId): bool
    {
        return $user->municipal_id === $municipalId
            || $user->hasRole(EnumRoles::SUPER_ADMIN->value);
    }

    private function assertOpenAndUnreleased(AssistanceRequest $request): void
    {
        if (! in_array($request->status, [AssistanceStatus::Pending, AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)
            || $this->hasReleaseArtifacts($request)) {
            throw new \DomainException('This request can no longer be changed because it is finalized or has release information.');
        }
    }

    private function hasReleaseArtifacts(AssistanceRequest $request): bool
    {
        return $request->released_at !== null
            || $request->released_by_user_id !== null
            || filled($request->release_reference_number);
    }

    /** @return array{bool,?string,bool} applicable, exemption reason, required */
    private function applicability(AssistanceRequest $request, string $documentKey, bool $configuredRequired): array
    {
        if (! str_starts_with($documentKey, 'recipient_valid_id_')) {
            return [true, null, $configuredRequired];
        }

        if ($request->on_behalf_household_member_id === null) {
            return [false, 'Not applicable because this request was filed for the claimant.', false];
        }

        $exception = $request->recipient_id_exception;
        $hasUnavailableReason = $exception === 'no_government_id'
            && mb_strlen(trim((string) $request->recipient_id_exception_reason)) >= 10;
        if (in_array($exception, ['minor', 'deceased'], true) || $hasUnavailableReason) {
            return [false, 'Not applicable because the assisted person has a recorded ID exception.', false];
        }

        // Recipient slots are stored as optional because they do not apply to
        // self-filed requests. For an on-behalf request, mirror the configured
        // requirement of the corresponding filer ID side.
        $filerDocumentKey = str_replace('recipient_', '', $documentKey);
        $filerDocument = $request->assistanceType?->documents
            ->first(fn ($document): bool => $document->key === $filerDocumentKey);
        $isRequired = $filerDocument !== null
            ? (bool) $filerDocument->pivot->is_required
            : $configuredRequired;

        return [true, null, $isRequired];
    }

    /** @return list<string> */
    private function readinessBlockers(AssistanceRequest $request): array
    {
        $this->loadVerificationRelations($request);
        $blockers = [];

        if ($request->snapshot === null) {
            $blockers[] = 'The request is missing its frozen claimant snapshot.';
        }
        if ($request->document_requirements_captured_at === null) {
            $blockers[] = 'The request document checklist has not been captured.';
        }
        if ($request->reviewed_by_user_id === null) {
            $blockers[] = 'Assign an MSWD reviewer before completing verification.';
        }
        if (! $request->beneficiary?->isIdentityVerified() || ! $request->beneficiary?->hasMedia('identity_id_front')) {
            $blockers[] = 'The claimant identity has not been verified with a front ID document.';
        }

        if ($request->on_behalf_household_member_id !== null && ! $this->recipientIsExempt($request)) {
            $member = $request->onBehalfHouseholdMember;
            if ($member === null || ! $member->is_verified_dependent) {
                $blockers[] = 'The assisted household member has not been verified.';
            }
        }

        if ($this->requiresDateOfDeath($request) && blank($request->on_behalf_date_of_death)) {
            $blockers[] = 'Enter the deceased person\'s Date of Death before completing MSWD verification.';
        }

        $assessment = data_get($request->metadata, 'household_assessment_snapshot');
        if (! is_array($assessment) || ! is_array($assessment['members'] ?? null) || $assessment['members'] === []) {
            $blockers[] = 'Capture the assessed household using Sync Household before completing verification.';
        }

        foreach ($request->documentChecks as $check) {
            if (! $check->is_applicable || ! $check->is_required) {
                continue;
            }

            $media = $this->resolveCurrentRequestMedia($request, $check->document_key, null);
            if (! $media instanceof Media) {
                $blockers[] = "Upload {$check->label}.";

                continue;
            }
            if ($check->verification_status !== AssistanceRequestDocumentCheckStatus::Verified
                || (int) $check->inspected_media_id !== (int) $media->id
                || ! filled($check->inspected_media_version)
                || ! hash_equals((string) $check->inspected_media_version, $this->mediaVersion($media))) {
                $blockers[] = "MSWD must accept the current {$check->label} scan and physical copy.";

                continue;
            }
            try {
                $this->assertCopyTypeAccepted($check, $check->presented_copy_type);
            } catch (\DomainException) {
                $blockers[] = "The recorded physical copy for {$check->label} is not acceptable.";
            }
        }

        return array_values(array_unique($blockers));
    }

    private function recipientIsExempt(AssistanceRequest $request): bool
    {
        $exception = $request->recipient_id_exception;

        return in_array($exception, ['minor', 'deceased'], true)
            || ($exception === 'no_government_id'
                && mb_strlen(trim((string) $request->recipient_id_exception_reason)) >= 10);
    }

    private function requiresDateOfDeath(AssistanceRequest $request): bool
    {
        $municipalCode = Municipality::query()->whereKey($request->municipal_id)->value('municipal_code');

        return $this->formDefinitions->for($municipalCode, $request->assistanceType?->slug)->requiresDateOfDeath();
    }

    private function resolveCurrentRequestMedia(AssistanceRequest $request, string $documentKey, ?int $expectedMediaId): ?Media
    {
        $media = $request->getMedia('documents')
            ->filter(fn (Media $item): bool => $item->getCustomProperty('document_key') === $documentKey)
            ->sortByDesc('id')
            ->first();

        if ($media !== null && $expectedMediaId !== null && (int) $media->id !== $expectedMediaId) {
            return null;
        }

        return $media;
    }

    private function assertCopyTypeAccepted(AssistanceRequestDocumentCheck $check, ?PhysicalCopyRequirement $copyType): void
    {
        $requirement = $check->physical_copy_requirement ?? PhysicalCopyRequirement::Unspecified;
        if (! $requirement->accepts($copyType)) {
            throw new \DomainException("The presented copy does not meet the {$requirement->label()} requirement.");
        }
    }

    private function presentedCopyType(PhysicalCopyRequirement|string|null $copyType): ?PhysicalCopyRequirement
    {
        if ($copyType === null || $copyType instanceof PhysicalCopyRequirement) {
            return $copyType;
        }

        $presented = PhysicalCopyRequirement::tryFrom($copyType);
        if ($presented === null || ! in_array($presented, PhysicalCopyRequirement::presentedCases(), true)) {
            throw new \DomainException('Choose a valid physical copy type.');
        }

        return $presented;
    }

    private function invalidateCurrentVerification(AssistanceRequest $request, ?string $note): void
    {
        if ($request->mswd_verification_status === MswdVerificationStatus::Verified) {
            // A completed verification is intentionally not silently changed.
            throw new \DomainException('Reopen MSWD verification with a correction reason before changing assessed evidence.');
        }

        $request->updateMswdVerification([
            'mswd_verification_fingerprint' => null,
            'mswd_verified_by_user_id' => null,
            'mswd_verified_at' => null,
            'mswd_verification_notes' => $note,
        ]);
    }

    private function verificationFingerprint(AssistanceRequest $request): string
    {
        $this->loadVerificationRelations($request);
        $checks = $request->documentChecks->map(function (AssistanceRequestDocumentCheck $check) use ($request): array {
            $media = $this->resolveCurrentRequestMedia($request, $check->document_key, null);

            return [
                'key' => $check->document_key,
                'required' => $check->is_required,
                'applicable' => $check->is_applicable,
                'status' => $check->verification_status?->value,
                'media_id' => $media?->id,
                'media_version' => $media ? $this->mediaVersion($media) : null,
                'inspected_media_id' => $check->inspected_media_id,
                'inspected_media_version' => $check->inspected_media_version,
                'copy' => $check->presented_copy_type?->value,
            ];
        })->sortBy('key')->values()->all();

        $frontId = $request->beneficiary?->getFirstMedia('identity_id_front');
        $payload = [
            'request_id' => $request->id,
            'snapshot' => $request->snapshot?->getAttributes(),
            'claimant_identity' => [
                'id' => $request->beneficiary_id,
                'verified_at' => $request->beneficiary?->identity_verified_at?->toIso8601String(),
                'front_id' => $frontId ? $this->mediaVersion($frontId) : null,
            ],
            'assisted_person' => [
                'id' => $request->on_behalf_household_member_id,
                'verified' => $request->onBehalfHouseholdMember?->is_verified_dependent,
                'active' => $request->onBehalfHouseholdMember?->is_active,
                'date_of_death' => $request->on_behalf_date_of_death?->toDateString(),
                'recipient_id_exception' => $request->recipient_id_exception,
                'recipient_id_exception_reason' => $request->recipient_id_exception_reason,
            ],
            'household_assessment' => data_get($request->metadata, 'household_assessment_snapshot'),
            'requirements_captured_at' => $request->document_requirements_captured_at?->toIso8601String(),
            'checks' => $checks,
        ];

        return hash('sha256', json_encode($payload, JSON_THROW_ON_ERROR));
    }

    private function mediaVersion(Media $media): string
    {
        return hash('sha256', implode('|', [
            $media->id,
            $media->uuid,
            $media->file_name,
            $media->size,
            $media->updated_at?->toIso8601String(),
        ]));
    }

    private function assertReason(string $reason): void
    {
        $length = mb_strlen(trim($reason));
        if ($length < 10 || $length > 1000) {
            throw new \DomainException('Enter a correction reason of 10 to 1,000 characters.');
        }
    }

    /** @param array<string, mixed> $properties */
    private function recordActivity(AssistanceRequest $request, string $actorId, string $message, array $properties = []): void
    {
        activity('assistance_request')
            ->performedOn($request)
            ->causedBy(User::find($actorId))
            ->withProperties([
                'municipal_id' => $request->municipal_id,
                ...$properties,
            ])
            ->log($message);
    }

    /** @return array{id:string,name:string} */
    private function actorPayload(User $user): array
    {
        $name = trim(implode(' ', array_filter([$user->first_name, $user->last_name])));

        return ['id' => (string) $user->id, 'name' => $name !== '' ? $name : ($user->user_name ?? 'Unknown user')];
    }
}
