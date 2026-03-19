<?php

namespace App\Core\Cemetery\Repositories;

use App\Core\Cemetery\Dto\DecedentDto;
use App\Core\Cemetery\Models\Decedent;

class DecedentsRepository
{

    public function save(DecedentDto $dto, string $decedentId, ?string $addressId): Decedent
    {
        return Decedent::create([
            'id' => $decedentId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'memorial_name' => $dto->memorialName,
            'date_of_birth' => $dto->dateOfBirth,
            'date_of_death' => $dto->dateOfDeath,
            'date_of_registration' => $dto->dateOfRegistration,
            'decedent_type' => $dto->decedentType,
            'reference_document_type' => $dto->referenceDocumentType,
            'reference_document_number' => $dto->referenceDocumentNumber,
            'place_of_death' => $dto->placeOfDeath,
            'gender' => $dto->gender,
            'cause_of_death' => $dto->causeOfDeath,
            'death_certificate_no' => $dto->deathCertNumber,
            'notes' => $dto->notes,
            'municipal_id' => $dto->municipalId,
            'address_id' => $addressId,
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