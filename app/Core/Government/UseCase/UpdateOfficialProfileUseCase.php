<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\OfficialDto;
use App\Core\Government\Repositories\OfficialRepository;

class UpdateOfficialProfileUseCase
{

    public function __construct(
        private OfficialRepository $officialRepo,
    ) {
    }

    public function execute(OfficialDto $dto, string $officialId)
    {

        return $this->officialRepo->update(
            [
                'first_name' => $dto->firstName,
                'last_name' => $dto->lastName,
                'middle_name' => $dto->middleName,
                'suffix' => $dto->suffix,
                'gender' => $dto->gender,
                'biography' => $dto->biography,
            ],
            $dto->municipalId,
            $officialId
        );

    }

}