<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Dto\Assistance\AssistanceRequestHouseholdMemberData;
use App\Core\ActionCenter\Dto\Assistance\ResolvedAssistanceRequestHouseholdData;
use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\HouseholdMember;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;
use Throwable;

class ResolveAssistanceRequestHouseholdAction
{
    /**
     * @param  EloquentCollection<int, HouseholdMember>|null  $currentMembers
     */
    public function execute(
        AssistanceRequest $request,
        ?EloquentCollection $currentMembers = null,
    ): ResolvedAssistanceRequestHouseholdData {
        $assessment = data_get($request->metadata, 'household_assessment_snapshot');

        if ($this->containsMembersArray($assessment)) {
            return $this->fromSnapshot(
                $request,
                $assessment,
                ResolvedAssistanceRequestHouseholdData::SOURCE_ASSESSMENT,
            );
        }

        $filing = data_get($request->metadata, 'household_composition_snapshot');

        if ($this->containsMembersArray($filing)) {
            return $this->fromSnapshot(
                $request,
                $filing,
                ResolvedAssistanceRequestHouseholdData::SOURCE_FILING,
            );
        }

        $currentMembers ??= HouseholdMember::query()
            ->where('household_id', $request->household_id)
            ->where('is_active', true)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();

        $ageReferenceAt = $request->created_at?->toImmutable() ?? CarbonImmutable::now();
        $members = $currentMembers
            ->map(
                fn (HouseholdMember $member): AssistanceRequestHouseholdMemberData => AssistanceRequestHouseholdMemberData::fromModel(
                    $member,
                    $ageReferenceAt,
                ),
            )
            ->values();

        return new ResolvedAssistanceRequestHouseholdData(
            householdId: filled($request->household_id) ? (string) $request->household_id : null,
            householdCode: $this->loadedHouseholdCode($request),
            members: $members,
            capturedAt: null,
            source: ResolvedAssistanceRequestHouseholdData::SOURCE_LEGACY_CURRENT_FALLBACK,
            usesCurrentFallback: true,
        );
    }

    private function containsMembersArray(mixed $snapshot): bool
    {
        return is_array($snapshot)
            && array_key_exists('members', $snapshot)
            && is_array($snapshot['members']);
    }

    /** @param array<string, mixed> $snapshot */
    private function fromSnapshot(
        AssistanceRequest $request,
        array $snapshot,
        string $source,
    ): ResolvedAssistanceRequestHouseholdData {
        /** @var Collection<int, AssistanceRequestHouseholdMemberData> $members */
        $members = collect($snapshot['members'])
            ->filter(fn (mixed $member): bool => is_array($member))
            ->map(
                fn (array $member): AssistanceRequestHouseholdMemberData => AssistanceRequestHouseholdMemberData::fromSnapshot(
                    $member,
                ),
            )
            ->filter(
                fn (AssistanceRequestHouseholdMemberData $member): bool => $member->fullName !== '',
            )
            ->values();

        return new ResolvedAssistanceRequestHouseholdData(
            householdId: filled($snapshot['household_id'] ?? null)
                ? (string) $snapshot['household_id']
                : (filled($request->household_id) ? (string) $request->household_id : null),
            householdCode: filled($snapshot['household_code'] ?? null)
                ? (string) $snapshot['household_code']
                : $this->loadedHouseholdCode($request),
            members: $members,
            capturedAt: $this->parseCapturedAt($snapshot['captured_at'] ?? null),
            source: $source,
            usesCurrentFallback: false,
        );
    }

    private function parseCapturedAt(mixed $value): ?CarbonImmutable
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    private function loadedHouseholdCode(AssistanceRequest $request): ?string
    {
        if (! $request->relationLoaded('household')) {
            return null;
        }

        return filled($request->household?->household_code)
            ? (string) $request->household->household_code
            : null;
    }
}
