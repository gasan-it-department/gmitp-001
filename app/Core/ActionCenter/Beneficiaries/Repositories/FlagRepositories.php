<?php

namespace App\Core\ActionCenter\Beneficiaries\Repositories;

use App\Core\ActionCenter\Beneficiaries\Dto\FlagBeneficiaryDto;
use App\Core\ActionCenter\Beneficiaries\Models\BeneficiaryFlag;

class FlagRepositories
{

    public function create(FlagBeneficiaryDto $dto, string $flagId)
    {

        return BeneficiaryFlag::create([
            'id' => $flagId,

            'assistance_beneficiary_id' => $dto->beneficiaryId,

            'user_id' => $dto->userId,

            'reason' => $dto->reason,

            'severity' => $dto->severity,

            'notes' => $dto->notes,

            'expires_at' => $dto->expiresAt,
        ]);

    }

}