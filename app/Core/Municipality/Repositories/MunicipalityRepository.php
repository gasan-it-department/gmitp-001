<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;

class MunicipalityRepository
{
    public function save(AddMunicipalityDto $dto, string $municipalityId): Municipality
    {
        return Municipality::create([
            'id' => $municipalityId,
            'name' => $dto->name,
            'code' => $dto->code,
            'is_active' => $dto->isActive,
            'region_code' => $dto->regionCode,
            'zip_code' => $dto->zipCode,
        ]);
    }

    public function findById(string $municipalityId): ?Municipality
    {
        return Municipality::where('id', $municipalityId)
            ->first();
    }

    public function findByCode(string $code): ?Municipality
    {
        return Municipality::where('code', $code)
            ->first();
    }

    public function findByRegionCode(string $regionCode): ?Municipality
    {
        return Municipality::where('region_code', $regionCode)
            ->first();
    }

    public function findByName(string $name)
    {
        return Municipality::where('name', $name)
            ->first();
    }
    public function findByZipCode(string $zipCode)
    {
        return Municipality::where('zip_code', $zipCode)
            ->first();
    }
}
