<?php

namespace App\Core\ActionCenter\UseCase\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ReviewBeneficiaryIntakeDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class ReviewBeneficiaryIntakeAction
{
    public function execute(ReviewBeneficiaryIntakeDto $dto): Beneficiary
    {
        return DB::transaction(function () use ($dto) {
            $beneficiary = Beneficiary::query()
                ->with('household')
                ->whereKey($dto->beneficiaryId)
                ->lockForUpdate()
                ->firstOrFail();

            if ($beneficiary->municipal_id !== $dto->municipalId) {
                throw new AuthorizationException(
                    'You may only review beneficiaries from your own municipality.',
                );
            }

            if ($beneficiary->isIdentityVerified()) {
                throw new \DomainException('This beneficiary intake has already been verified.');
            }

            if ($beneficiary->isIntakeRejected()) {
                throw new \DomainException('This beneficiary intake has already been rejected.');
            }

            $sourceHousehold = Household::query()
                ->whereKey($beneficiary->household_id)
                ->lockForUpdate()
                ->firstOrFail();

            $sourceMembers = HouseholdMember::query()
                ->where('household_id', $sourceHousehold->id)
                ->where('is_active', true)
                ->lockForUpdate()
                ->get();

            $dependents = $sourceMembers
                ->reject(fn (HouseholdMember $member) => $member->relationship === Relationship::Head->value);

            $verifiedIds = collect($dto->verifiedMemberIds)->unique()->values();
            $rejectedIds = collect($dto->rejectedMemberIds)->unique()->values();
            $submittedIds = $verifiedIds->merge($rejectedIds);

            if ($verifiedIds->intersect($rejectedIds)->isNotEmpty()
                || $submittedIds->sort()->values()->all() !== $dependents->pluck('id')->sort()->values()->all()) {
                throw new \DomainException(
                    'Review every submitted household member exactly once before completing the intake.',
                );
            }

            $targetHousehold = $sourceHousehold;
            $matchedMember = null;

            if ($dto->householdResolution === 'join_existing') {
                if ($dto->targetMemberId === null) {
                    throw new \DomainException('Choose the matching household member to join.');
                }

                $matchedMember = HouseholdMember::query()
                    ->with('household')
                    ->whereKey($dto->targetMemberId)
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($matchedMember->household?->municipal_id !== $dto->municipalId
                    || $matchedMember->household_id === $sourceHousehold->id) {
                    throw new AuthorizationException('The selected household match is not available.');
                }

                if (! $matchedMember->household->isVerified()) {
                    throw new \DomainException(
                        'The selected household must have a verified Head before another claimant can join it.',
                    );
                }

                if ($matchedMember->beneficiary_id !== null
                    && $matchedMember->beneficiary_id !== $beneficiary->id) {
                    throw new \DomainException(
                        'That household member is already linked to another beneficiary.',
                    );
                }

                $isExactMatch = $this->matchesBeneficiary($matchedMember, $beneficiary);

                if (! $isExactMatch && blank($dto->householdResolutionReason)) {
                    throw new \DomainException(
                        'Explain why the selected household member represents this claimant before joining the household.',
                    );
                }

                $targetHousehold = $matchedMember->household;
                $matchedMember->update([
                    'beneficiary_id' => $beneficiary->id,
                    'is_verified_dependent' => true,
                ]);

                $beneficiary->update(['household_id' => $targetHousehold->id]);
            } elseif ($dto->householdResolution !== 'keep_existing') {
                throw new \DomainException('Choose whether to keep or join a household.');
            }

            foreach ($dependents as $member) {
                if ($rejectedIds->contains($member->id)) {
                    $member->delete();

                    continue;
                }

                if ($targetHousehold->id !== $sourceHousehold->id) {
                    $duplicate = $this->findExactDependent(
                        $targetHousehold->id,
                        $member,
                        $matchedMember?->id,
                    );

                    if ($duplicate !== null) {
                        $duplicate->update([
                            'beneficiary_id' => $duplicate->beneficiary_id ?? $member->beneficiary_id,
                            'is_verified_dependent' => $duplicate->relationship !== Relationship::Head->value,
                        ]);
                        $member->delete();

                        continue;
                    }
                }

                $member->update([
                    'household_id' => $targetHousehold->id,
                    'is_verified_dependent' => true,
                ]);
            }

            if ($targetHousehold->id !== $sourceHousehold->id) {
                $sourceMembers
                    ->firstWhere('relationship', Relationship::Head->value)
                    ?->delete();
                $sourceHousehold->delete();
            }

            $beneficiary->update([
                'identity_verified_at' => now(),
                'identity_verified_by_user_id' => $dto->actingAdminId,
            ]);

            activity('beneficiary-intake')
                ->performedOn($beneficiary)
                ->causedBy(User::find($dto->actingAdminId))
                ->withProperties([
                    'municipal_id' => $dto->municipalId,
                    'household_resolution' => $dto->householdResolution,
                    'source_household_id' => $sourceHousehold->id,
                    'resolved_household_id' => $targetHousehold->id,
                    'verified_member_ids' => $verifiedIds->all(),
                    'rejected_member_ids' => $rejectedIds->all(),
                    'household_resolution_reason' => $dto->householdResolutionReason,
                ])
                ->log('Reviewed and verified beneficiary intake');

            return $beneficiary->fresh(['household', 'identityVerifier']);
        }, attempts: 3);
    }

    private function matchesBeneficiary(HouseholdMember $member, Beneficiary $beneficiary): bool
    {
        return $member->first_name === $beneficiary->first_name
            && $member->last_name === $beneficiary->last_name
            && $member->birth_date?->toDateString() === $beneficiary->birth_date?->toDateString();
    }

    private function findExactDependent(
        string $householdId,
        HouseholdMember $source,
        ?string $excludeMemberId,
    ): ?HouseholdMember {
        if ($source->birth_date === null) {
            return null;
        }

        return HouseholdMember::query()
            ->where('household_id', $householdId)
            ->where('is_active', true)
            ->when($excludeMemberId, fn ($query) => $query->whereKeyNot($excludeMemberId))
            ->where('first_name', $source->first_name)
            ->where('last_name', $source->last_name)
            ->whereDate('birth_date', $source->birth_date)
            ->lockForUpdate()
            ->first();
    }
}
