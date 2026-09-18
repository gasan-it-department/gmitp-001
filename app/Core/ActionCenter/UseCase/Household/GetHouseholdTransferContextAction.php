<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberIdentityMatcher;

final class GetHouseholdTransferContextAction
{
    public function __construct(
        private readonly EvaluateHouseholdHeadCandidateAction $evaluateCandidate,
        private readonly HouseholdMemberIdentityMatcher $identityMatcher,
    ) {}

    /** @return array<string, mixed> */
    public function execute(string $municipalId, string $householdId, string $beneficiaryId): array
    {
        $destination = Household::query()
            ->where('municipal_id', $municipalId)
            ->findOrFail($householdId);
        $beneficiary = Beneficiary::query()
            ->where('municipal_id', $municipalId)
            ->whereNull('merged_into_beneficiary_id')
            ->with('household')
            ->findOrFail($beneficiaryId);
        $sourceHousehold = Household::query()
            ->where('municipal_id', $municipalId)
            ->findOrFail($beneficiary->household_id);
        $sourceMembers = HouseholdMember::query()
            ->with('beneficiary')
            ->where('household_id', $sourceHousehold->id)
            ->orderByRaw("CASE WHEN relationship = 'head' THEN 0 ELSE 1 END")
            ->orderBy('created_at')
            ->get();
        $sourceMember = $sourceMembers->first(
            fn (HouseholdMember $member): bool => $member->beneficiary_id === $beneficiary->id
                && $member->is_active,
        );

        if ($sourceMember === null) {
            throw new \DomainException('The beneficiary has no active row in their current household.');
        }

        $destinationMatches = HouseholdMember::query()
            ->where('household_id', $destination->id)
            ->where(function ($query) use ($beneficiary): void {
                $query->whereNull('beneficiary_id')->orWhere('beneficiary_id', $beneficiary->id);
            })
            ->get()
            ->filter(fn (HouseholdMember $member): bool => $this->identityMatcher->mismatches($member, $beneficiary) === [])
            ->values();

        if ($destinationMatches->count() > 1) {
            throw new \DomainException(
                'Multiple destination roster rows match this beneficiary. Correct the household roster before transferring.',
            );
        }

        $isHead = $sourceMember->relationship === Relationship::Head->value;
        $successors = $sourceMembers
            ->reject(fn (HouseholdMember $member): bool => $member->id === $sourceMember->id)
            ->map(fn (HouseholdMember $member): array => [
                'id' => $member->id,
                'full_name' => trim(implode(' ', array_filter([
                    $member->first_name,
                    $member->middle_name,
                    $member->last_name,
                    $member->suffix,
                ]))),
                'relationship' => $member->relationship,
                'reason' => $this->evaluateCandidate->execute($member, $sourceHousehold),
            ])
            ->values();

        return [
            'beneficiary' => [
                'id' => $beneficiary->id,
                'beneficiary_number' => $beneficiary->beneficiary_number,
                'full_name' => $beneficiary->full_name,
            ],
            'source_household' => [
                'id' => $sourceHousehold->id,
                'household_code' => $sourceHousehold->household_code,
            ],
            'destination_household' => [
                'id' => $destination->id,
                'household_code' => $destination->household_code,
            ],
            'already_in_destination' => $sourceHousehold->id === $destination->id,
            'source_is_head' => $isHead,
            'successors' => $successors,
            'destination_member_id' => $destinationMatches->first()?->id,
            'destination_member_relationship' => $destinationMatches->first()?->relationship,
        ];
    }
}
