<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use Illuminate\Auth\Access\AuthorizationException;
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
        );
    }

    public function executeForHousehold(
        string $householdId,
        StoreHouseholdMemberDto $dto,
        string $municipalId,
        bool $isVerifiedDependent,
    ): HouseholdMember {
        return DB::transaction(function () use ($householdId, $dto, $municipalId, $isVerifiedDependent) {
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

            return $this->storeMember->execute(
                $dto,
                isVerifiedDependent: $isVerifiedDependent,
            );
        }, attempts: 3);
    }
}
