<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\UseCase\Beneficiary\CheckBeneficiaryRegistrationIdentityAction;
use App\Core\ActionCenter\UseCase\Shared\LockActionCenterMunicipalityAction;
use Illuminate\Support\Facades\DB;

final class ReviewGoodsRegistrationAction
{
    public function __construct(
        private readonly CheckBeneficiaryRegistrationIdentityAction $checkIdentity,
        private readonly LockActionCenterMunicipalityAction $lockMunicipality,
        private readonly GetRegistrationHouseholdAction $household,
    ) {}

    public function execute(array $data, string $municipalId, string $actorId): void
    {
        DB::transaction(function () use ($data, $municipalId, $actorId) {
            $this->lockMunicipality->execute($municipalId);
            $this->checkIdentity->authorizeCreation($data, $municipalId, $actorId, $data['identity_check_context'], $data['different_person_reason'] ?? null);
            if (! empty($data['household_id'])) {
                $this->household->execute($municipalId, $data['household_id']);
            }
        });
    }
}
