<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\HouseholdMemberDuplicateReviewDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberDuplicateService;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use App\Core\Users\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StoreAdminHouseholdMemberAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeMember,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
    ) {}

    public function execute(
        Beneficiary $beneficiary,
        StoreHouseholdMemberDto $dto,
        string $municipalId,
        bool $isVerifiedDependent,
        ?HouseholdMemberDuplicateReviewDto $duplicateReview = null,
    ): HouseholdMember {
        if ($dto->householdId !== $beneficiary->household_id) {
            throw new AuthorizationException(
                'You may only add household members to the beneficiary\'s current household.',
            );
        }

        return $this->executeForHousehold(
            householdId: $beneficiary->household_id,
            dto: $dto,
            municipalId: $municipalId,
            isVerifiedDependent: $isVerifiedDependent,
            duplicateReview: $duplicateReview,
        );
    }

    public function executeForHousehold(
        string $householdId,
        StoreHouseholdMemberDto $dto,
        string $municipalId,
        bool $isVerifiedDependent,
        ?HouseholdMemberDuplicateReviewDto $duplicateReview = null,
    ): HouseholdMember {
        return DB::transaction(function () use ($householdId, $dto, $municipalId, $isVerifiedDependent, $duplicateReview) {
            $this->lockMunicipality->execute($municipalId);
            $household = Household::query()
                ->whereKey($householdId)
                ->where('municipal_id', $municipalId)
                ->lockForUpdate()
                ->first();

            if ($household === null || $dto->householdId !== $household->id) {
                throw new AuthorizationException(
                    'You may only add household members within your municipality.',
                );
            }

            $candidates = app(HouseholdMemberDuplicateService::class)->authorize($dto, $municipalId, Auth::id(), $duplicateReview);
            $member = $this->storeMember->execute(
                $dto,
                isVerifiedDependent: $isVerifiedDependent,
            );
            if ($candidates !== []) {
                activity('household_member')->performedOn($member)->causedBy(User::find(Auth::id()))
                    ->withProperties(['municipal_id' => $municipalId, 'household_id' => $householdId,
                        'candidate_keys' => array_column($candidates, 'key'), 'reason' => trim((string) $duplicateReview->reason)])
                    ->log('Added a household member after reviewing possible matches as a different person');
            }

            return $member;
        }, attempts: 3);
    }
}
