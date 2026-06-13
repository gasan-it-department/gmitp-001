<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Exceptions\HouseholdMemberDeclarationException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class DeclareHouseholdMemberForAssistanceAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeMember,
    ) {}

    public function execute(
        Beneficiary $beneficiary,
        StoreHouseholdMemberDto $dto,
        string $actingUserId,
        string $municipalId,
    ): HouseholdMember {
        return DB::transaction(function () use ($beneficiary, $dto, $actingUserId, $municipalId) {
            $lockedBeneficiary = Beneficiary::query()
                ->whereKey($beneficiary->id)
                ->where('user_id', $actingUserId)
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->first();

            if ($lockedBeneficiary === null || $dto->householdId !== $lockedBeneficiary->household_id) {
                throw new AuthorizationException('You may only add a member to your own household.');
            }

            if (! $lockedBeneficiary->is_active) {
                throw HouseholdMemberDeclarationException::beneficiaryInactive();
            }

            if (! $lockedBeneficiary->isIdentityVerified()) {
                throw HouseholdMemberDeclarationException::profileNotVerified();
            }

            $household = Household::query()
                ->with('activeHead.beneficiary')
                ->whereKey($lockedBeneficiary->household_id)
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->firstOrFail();

            if (! $household->isVerified()) {
                throw HouseholdMemberDeclarationException::householdNotVerified();
            }

            if ($dto->relationship === Relationship::Head->value) {
                throw HouseholdMemberDeclarationException::invalidRelationship();
            }

            $hasPendingMember = HouseholdMember::query()
                ->where('household_id', $household->id)
                ->where('is_active', true)
                ->where('relationship', '!=', Relationship::Head->value)
                ->where('is_verified_dependent', false)
                ->exists();

            if ($hasPendingMember) {
                throw HouseholdMemberDeclarationException::pendingMemberExists();
            }

            $member = $this->storeMember->execute(
                $dto,
                isVerifiedDependent: false,
            );

            activity('household-member-declaration')
                ->performedOn($member)
                ->causedBy(User::find($actingUserId))
                ->withProperties([
                    'municipal_id' => $municipalId,
                    'household_id' => $household->id,
                    'beneficiary_id' => $lockedBeneficiary->id,
                    'verification_state' => 'pending',
                    'source' => 'assistance_application',
                ])
                ->log('Citizen declared a household member while applying for assistance');

            return $member;
        }, attempts: 3);
    }
}
