<?php

namespace App\Core\ActionCenter\Beneficiaries\Repositories;

use App\Core\ActionCenter\Beneficiaries\Models\Beneficiary;
use App\Core\ActionCenter\Beneficiaries\Dto\CreateBeneficiaryDto;

class BeneficiaryRepositories
{

    public function save(CreateBeneficiaryDto $dto, string $beneficiaryId)
    {

        return Beneficiary::create([

            'id' => $beneficiaryId,

            'first_name' => $dto->firstName,

            'middle_name' => $dto->middleName,

            'last_name' => $dto->lastName,

            'suffix' => $dto->suffix,

            'birth_date' => $dto->birthDate,

            'province' => $dto->province,

            'municipality' => $dto->municipality,

            'barangay' => $dto->barangay,

        ]);

    }

    public function getBeneficiaryById(string $beneficiaryId)
    {

        return Beneficiary::findOrFail($beneficiaryId);

    }

}