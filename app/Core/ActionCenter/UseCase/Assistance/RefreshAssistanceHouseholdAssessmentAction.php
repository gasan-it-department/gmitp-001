<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestHouseholdMemberData;
use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\Core\Users\Models\User;
use Carbon\CarbonImmutable;
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
    ): AssistanceRequest {
        return DB::transaction(function () use ($assistanceRequestId, $municipalId, $actingUserId): AssistanceRequest {
            $request = $this->lockRequest->execute(
                id: $assistanceRequestId,
                municipalId: $municipalId,
                with: ['beneficiary', 'household'],
            );

            $this->ensureAssessmentCanBeRefreshed($request, $actingUserId, $municipalId);

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

            $snapshotMembers = $members
                ->map(
                    fn (HouseholdMember $member): array => AssistanceRequestHouseholdMemberData::fromModel(
                        $member,
                        $ageReferenceAt,
                    )->toArray(),
                )
                ->values()
                ->all();

            $metadata = $request->metadata ?? [];
            $previousCapturedAt = data_get($metadata, 'household_assessment_snapshot.captured_at');
            $metadata['household_assessment_snapshot'] = [
                'household_id' => $request->household_id,
                'household_code' => $request->household->household_code,
                'captured_at' => $capturedAt->toIso8601String(),
                'captured_by_user_id' => $actingUserId,
                'source' => 'mswd_interview',
                'members' => $snapshotMembers,
            ];

            $request->update(['metadata' => $metadata]);

            activity('assistance_request')
                ->performedOn($request)
                ->causedBy(User::find($actingUserId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'previous_household_assessment_captured_at' => $previousCapturedAt,
                    'household_assessment_captured_at' => $capturedAt->toIso8601String(),
                    'household_assessment_member_count' => count($snapshotMembers),
                ])
                ->log('Updated household assessment during assistance interview');

            return $request->fresh();
        }, attempts: 3);
    }

    private function ensureAssessmentCanBeRefreshed(
        AssistanceRequest $request,
        string $actingUserId,
        string $municipalId,
    ): void {
        if ($request->status !== AssistanceStatus::UnderReview) {
            throw new \DomainException(
                'The household assessment can only be updated while the assistance request is under review.',
            );
        }

        if ($request->reviewed_by_user_id !== $actingUserId) {
            throw new \DomainException(
                'Only the reviewer assigned to this case may update its household assessment.',
            );
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
    }
}
