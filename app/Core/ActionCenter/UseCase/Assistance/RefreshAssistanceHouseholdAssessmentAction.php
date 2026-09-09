<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestHouseholdMemberData;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Enums\MswdVerificationStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Explicitly capture the live household as the request's MSWD interview assessment.
 *
 * The filing-time household snapshot remains untouched. Reviewers may edit the
 * beneficiary's live roster independently, then invoke this action when that
 * roster represents the household they assessed for this specific case.
 */
class RefreshAssistanceHouseholdAssessmentAction
{
    public function __construct(
        private readonly LockAssistanceRequestAction $lockRequest,
    ) {}

    public function execute(
        string $assistanceRequestId,
        string $municipalId,
        string $actingUserId,
        bool $canProcessRequests,
        bool $canCorrectRequests,
        ?string $correctionReason,
        string $expectedFingerprint,
    ): AssistanceRequest {
        return DB::transaction(function () use (
            $assistanceRequestId,
            $municipalId,
            $actingUserId,
            $canProcessRequests,
            $canCorrectRequests,
            $correctionReason,
            $expectedFingerprint,
        ): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $assistanceRequestId,
                municipalId: $municipalId,
                with: ['beneficiary', 'household'],
            );

            $requiresCorrection = $this->ensureAssessmentCanBeRefreshed(
                request: $request,
                actingUserId: $actingUserId,
                municipalId: $municipalId,
                canProcessRequests: $canProcessRequests,
                canCorrectRequests: $canCorrectRequests,
                correctionReason: $correctionReason,
            );

            $capturedAt = CarbonImmutable::now();
            $ageReferenceAt = $request->created_at?->toImmutable() ?? $capturedAt;
            $members = HouseholdMember::query()
                ->where('household_id', $request->household_id)
                ->where('is_active', true)
                ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
                ->orderBy('created_at')
                ->lockForUpdate()
                ->get();

            if ($members->isEmpty()) {
                throw new \DomainException(
                    'The household has no active members to capture. Resolve the household roster before updating the assessment.',
                );
            }

            $snapshotMembers = $this->snapshotMembers($members, $ageReferenceAt);
            $preview = $this->previewFromMembers($request, $snapshotMembers);

            if (! hash_equals($preview['fingerprint'], $expectedFingerprint)) {
                throw new \DomainException(
                    'The household or request changed while you were reviewing it. Refresh the comparison before synchronizing.',
                );
            }

            if ($preview['previous_source'] === 'assessment' && ! $this->previewHasChanges($preview)) {
                throw new \DomainException('The household assessment is already up to date.');
            }

            $assessment = [
                'household_id' => $request->household_id,
                'household_code' => $request->household->household_code,
                'captured_at' => $capturedAt->toIso8601String(),
                'captured_by_user_id' => $actingUserId,
                'source' => $requiresCorrection ? 'approved_correction' : 'mswd_interview',
                'members' => $snapshotMembers,
            ];
            $previousAssessment = $this->previousAssessment($request);
            $request->replaceHouseholdAssessment($assessment);

            if ($requiresCorrection) {
                // A signed-off assessment cannot remain current after the
                // household evidence changes. Keep the amount decision intact,
                // but require the assigned MSWD reviewer to complete a fresh
                // verification before financial documents/release continue.
                $request->updateMswdVerification([
                    'mswd_verification_status' => MswdVerificationStatus::UnderReview,
                    'mswd_verification_notes' => trim((string) $correctionReason),
                    'mswd_verified_by_user_id' => null,
                    'mswd_verified_at' => null,
                    'mswd_verification_fingerprint' => null,
                ]);
            }

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($actingUserId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'old' => ['household_assessment_snapshot' => $previousAssessment],
                    'attributes' => ['household_assessment_snapshot' => $assessment],
                    'correction_reason' => $requiresCorrection ? trim((string) $correctionReason) : null,
                    'assessment_status' => $request->status->value,
                    'assessment_fingerprint' => $preview['fingerprint'],
                ])
                ->log($requiresCorrection
                    ? 'Corrected completed household assessment'
                    : 'Updated household assessment during assistance interview');

            return $request->fresh();
        }, attempts: 3);
    }

    /**
     * @param  Collection<int, HouseholdMember>  $members
     * @return array{fingerprint: string, previous_source: string, added: list<array<string, mixed>>, removed: list<array<string, mixed>>, changed: list<array<string, mixed>>, current_member_count: int}
     */
    public function preview(AssistanceRequest $request, Collection $members): array
    {
        $ageReferenceAt = $request->created_at?->toImmutable() ?? CarbonImmutable::now();

        return $this->previewFromMembers($request, $this->snapshotMembers($members, $ageReferenceAt));
    }

    /**
     * @param  Collection<int, HouseholdMember>  $members
     * @return list<array<string, mixed>>
     */
    private function snapshotMembers(Collection $members, CarbonImmutable $ageReferenceAt): array
    {
        return $members->map(
            fn (HouseholdMember $member): array => AssistanceRequestHouseholdMemberData::fromModel(
                $member,
                $ageReferenceAt,
            )->toArray(),
        )->values()->all();
    }

    /**
     * @param  list<array<string, mixed>>  $currentMembers
     * @return array{fingerprint: string, previous_source: string, added: list<array<string, mixed>>, removed: list<array<string, mixed>>, changed: list<array<string, mixed>>, current_member_count: int}
     */
    private function previewFromMembers(AssistanceRequest $request, array $currentMembers): array
    {
        $previous = $this->previousAssessment($request);
        $previousMembers = is_array($previous['members'] ?? null) ? $previous['members'] : [];
        $comparison = $this->compareMembers($previousMembers, $currentMembers);
        $fingerprintPayload = [
            'request_id' => $request->id,
            'status' => $request->status->value,
            'released_at' => $request->released_at?->toIso8601String(),
            'released_by_user_id' => $request->released_by_user_id,
            'release_reference_number' => $request->release_reference_number,
            'previous' => $previous,
            'current_members' => $currentMembers,
        ];

        return [
            'fingerprint' => hash('sha256', json_encode($fingerprintPayload, JSON_THROW_ON_ERROR)),
            'previous_source' => is_array(data_get($request->metadata, 'household_assessment_snapshot'))
                ? 'assessment'
                : (is_array(data_get($request->metadata, 'household_composition_snapshot')) ? 'filing' : 'none'),
            'added' => $comparison['added'],
            'removed' => $comparison['removed'],
            'changed' => $comparison['changed'],
            'current_member_count' => count($currentMembers),
        ];
    }

    /** @return array<string, mixed> */
    private function previousAssessment(AssistanceRequest $request): array
    {
        $assessment = data_get($request->metadata, 'household_assessment_snapshot');
        if (is_array($assessment)) {
            return $assessment;
        }

        $filingSnapshot = data_get($request->metadata, 'household_composition_snapshot');

        return is_array($filingSnapshot) ? $filingSnapshot : [];
    }

    /**
     * @param  list<array<string, mixed>>  $previousMembers
     * @param  list<array<string, mixed>>  $currentMembers
     * @return array{added: list<array<string, mixed>>, removed: list<array<string, mixed>>, changed: list<array<string, mixed>>}
     */
    private function compareMembers(array $previousMembers, array $currentMembers): array
    {
        $previousByKey = $this->membersByKey($previousMembers);
        $currentByKey = $this->membersByKey($currentMembers);
        $added = [];
        $removed = [];
        $changed = [];

        foreach ($currentByKey as $key => $member) {
            if (! isset($previousByKey[$key])) {
                $added[] = $this->memberSummary($member);

                continue;
            }

            $fields = $this->changedFields($previousByKey[$key], $member);
            if ($fields !== []) {
                $changed[] = [...$this->memberSummary($member), 'fields' => $fields];
            }
        }
        foreach ($previousByKey as $key => $member) {
            if (! isset($currentByKey[$key])) {
                $removed[] = $this->memberSummary($member);
            }
        }

        return compact('added', 'removed', 'changed');
    }

    /**
     * @param  array{added: list<array<string, mixed>>, removed: list<array<string, mixed>>, changed: list<array<string, mixed>>}  $preview
     */
    private function previewHasChanges(array $preview): bool
    {
        return $preview['added'] !== []
            || $preview['removed'] !== []
            || $preview['changed'] !== [];
    }

    /** @param list<array<string, mixed>> $members @return array<string, array<string, mixed>> */
    private function membersByKey(array $members): array
    {
        $result = [];
        foreach ($members as $member) {
            $key = filled($member['household_member_id'] ?? null)
                ? 'member:'.$member['household_member_id']
                : 'legacy:'.mb_strtolower(trim((string) ($member['full_name'] ?? '')).'|'.(string) ($member['birth_date'] ?? ''));
            $result[$key] = $member;
        }

        return $result;
    }

    /** @param array<string, mixed> $member @return array{full_name: string, relationship: ?string} */
    private function memberSummary(array $member): array
    {
        return [
            'full_name' => (string) ($member['full_name'] ?? 'Unnamed household member'),
            'relationship' => filled($member['relationship'] ?? null) ? (string) $member['relationship'] : null,
        ];
    }

    /** @param array<string, mixed> $previous @param array<string, mixed> $current @return list<string> */
    private function changedFields(array $previous, array $current): array
    {
        $labels = [
            'full_name' => 'Name', 'relationship' => 'Relationship', 'birth_date' => 'Birth date', 'age_at_filing' => 'Age at filing',
            'sex' => 'Sex', 'educational_attainment' => 'Education', 'occupation' => 'Occupation', 'monthly_income' => 'Monthly income',
            'is_household_head' => 'Household head',
        ];

        return collect($labels)->filter(
            fn (string $label, string $field): bool => ! $this->valuesAreEquivalent(
                $field,
                $previous[$field] ?? null,
                $current[$field] ?? null,
            ),
        )->values()->all();
    }

    private function valuesAreEquivalent(string $field, mixed $previous, mixed $current): bool
    {
        if ($field === 'monthly_income' && is_numeric($previous) && is_numeric($current)) {
            return (float) $previous === (float) $current;
        }

        return $previous === $current;
    }

    private function ensureAssessmentCanBeRefreshed(
        AssistanceRequest $request,
        string $actingUserId,
        string $municipalId,
        bool $canProcessRequests,
        bool $canCorrectRequests,
        ?string $correctionReason,
    ): bool {
        if (! in_array($request->status, [AssistanceStatus::UnderReview, AssistanceStatus::Approved], true)) {
            throw new \DomainException(
                'The household assessment can only be updated while the request is under review or approved before release.',
            );
        }

        $isApproved = $request->status === AssistanceStatus::Approved;
        if ($isApproved && ($request->released_at !== null
            || $request->released_by_user_id !== null || $request->release_reference_number !== null)) {
            throw new \DomainException('This approved request already contains release data and cannot have its household assessment changed.');
        }
        // Read the persisted lifecycle value. The action always works on a
        // fresh locked row, and this also keeps the guard correct for legacy
        // rows hydrated before enum casts were introduced.
        $verificationIsComplete = MswdVerificationStatus::tryFrom(
            (string) $request->getRawOriginal('mswd_verification_status'),
        ) === MswdVerificationStatus::Verified;
        $requiresCorrection = $verificationIsComplete;

        if ($requiresCorrection) {
            if (! $canCorrectRequests) {
                throw new AuthorizationException('You are not authorized to correct a completed MSWD household assessment.');
            }
            if (mb_strlen(trim((string) $correctionReason)) < 10 || mb_strlen(trim((string) $correctionReason)) > 1000) {
                throw new \DomainException('Enter a household correction reason of 10 to 1,000 characters.');
            }
        } else {
            if (! $canProcessRequests) {
                throw new AuthorizationException('You are not authorized to update an MSWD household assessment.');
            }
            if ($request->reviewed_by_user_id !== $actingUserId) {
                throw new \DomainException('Only the reviewer assigned to this case may update its household assessment.');
            }
        }

        if ($request->household === null || $request->household->municipal_id !== $municipalId) {
            throw new \DomainException(
                'The request household is unavailable in the active municipality.',
            );
        }

        if ($request->beneficiary === null
            || ! $request->beneficiary->is_active
            || $request->beneficiary->household_id !== $request->household_id) {
            throw new \DomainException(
                'The request household no longer matches the beneficiary profile. Resolve the household record before updating the assessment.',
            );
        }

        return $requiresCorrection;
    }
}
