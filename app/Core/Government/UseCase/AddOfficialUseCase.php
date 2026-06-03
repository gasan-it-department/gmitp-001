<?php

namespace App\Core\Government\UseCase;

use App\Core\Government\Dto\OfficialDto;
use App\Core\Government\Models\Official;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;

class AddOfficialUseCase
{

    public function __construct(
        protected IdGeneratorInterface $idGenerator,
    ) {
    }

    public function execute(OfficialDto $dto)
    {

        $officialId = $this->idGenerator->generate();

        $official = Official::create([
            'id' => $officialId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'gender' => $dto->gender,
            'municipal_id' => $dto->municipalId,
            'biography' => $dto->biography,
        ]);

        if ($dto->profileImage) {

            $official->addMedia($dto->profileImage)
                ->toMediaCollection('official_portrait');
        }

        return $official->fresh(['media']);

    }

}
