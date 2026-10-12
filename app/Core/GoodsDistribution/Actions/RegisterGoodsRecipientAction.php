<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\ActionCenter\Dto\Beneficiary\CreateHouseholdBeneficiaryDto;
use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateBeneficiaryInHouseholdAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateWalkInBeneficiaryAction;
use App\Core\Users\Models\User;

final class RegisterGoodsRecipientAction
{
    public function __construct(
        private readonly CreateWalkInBeneficiaryAction $createHead,
        private readonly CreateBeneficiaryInHouseholdAction $createMember,
    ) {}

    public function head(CreateWalkInBeneficiaryDto $dto, bool $confirmedActualHead): Beneficiary
    {
        if (! $confirmedActualHead) {
            throw new \DomainException('Confirm that this person is the actual household head, or register them in an existing household.');
        }

        return $this->record($this->createHead->execute($dto), $dto->encodedByUserId);
    }

    public function member(CreateHouseholdBeneficiaryDto $dto): Beneficiary
    {
        return $this->record($this->createMember->execute($dto, requireRecordedHead: true), $dto->encodedByUserId);
    }

    private function record(Beneficiary $beneficiary, string $actorId): Beneficiary
    {
        activity('goods-recipient-registration')
            ->performedOn($beneficiary)
            ->causedBy(User::find($actorId))
            ->withProperties(['municipal_id' => $beneficiary->municipal_id, 'household_id' => $beneficiary->household_id])
            ->log('Registered a shared beneficiary profile through Goods Distribution; no goods handover recorded');

        return $beneficiary;
    }
}
