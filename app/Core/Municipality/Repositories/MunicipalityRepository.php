<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Collection;

class MunicipalityRepository
{
    public function save(AddMunicipalityDto $dto, string $municipalityId): void
    {
        Municipality::create([
            'id' => $municipalityId,
            'name' => $dto->name,
            'municipal_code' => $dto->code,
            'is_active' => $dto->isActive,
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
        return Municipality::where('municipal_code', $code)
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

    public function getAll(): Collection
    {
        return Municipality::all();
    }
}
