<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Models\Decedent;

class DecedentsRepository
{

    public function save(DecedentDto $dto, string $decedentId): Decedent
    {
        return Decedent::create([
            'id' => $decedentId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'date_of_birth' => $dto->dateOfBirth,
            'date_of_death' => $dto->dateOfDeath,
            'gender' => $dto->gender,
            'cause_of_death' => $dto->causeOfDeath,
            'death_certificate_no' => $dto->deathCertNumber,
            'notes' => $dto->notes,
            'municipal_id' => $dto->municipalId,
        ]);
    }

    public function findDecedentById(string $decedentId, string $municipalId)
    {

        return Decedent::where('municipal_id', $municipalId)
            ->findOrFail($decedentId);

    }

    public function getMunicipalitiesDecedents(string $municipalId)
    {

        return Decedent::where('municipal_id', $municipalId)
            ->paginate(10);

    }

}