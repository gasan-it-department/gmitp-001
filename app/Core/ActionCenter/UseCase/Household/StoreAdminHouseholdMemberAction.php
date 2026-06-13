<?php

namespace App\Core\ActionCenter\UseCase\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class StoreAdminHouseholdMemberAction
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeMember,
    ) {}

    public function execute(
        Beneficiary $beneficiary,
        StoreHouseholdMemberDto $dto,
        string $municipalId,
        bool $isVerifiedDependent,
    ): HouseholdMember {
        return DB::transaction(function () use ($beneficiary, $dto, $municipalId, $isVerifiedDependent) {
            $household = Household::query()
                ->whereKey($beneficiary->household_id)
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
