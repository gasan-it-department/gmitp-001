<?php

namespace App\Core\Municipality\Repositories;

use App\Core\Municipality\Dto\AddMunicipalityDto;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Eloquent\Collection;
use App\Core\Municipality\Dto\UpdateMunicipalityDto;
class MunicipalityRepository
{
    public function save(AddMunicipalityDto $dto, string $municipalityId, string $slug): Municipality
    {
        return Municipality::create([
            'id' => $municipalityId,
            'name' => $dto->name,
            'municipal_code' => $dto->code,
            'is_active' => $dto->isActive,
            'slug' => $slug,
            'zip_code' => $dto->zipCode,
        ]);
    }

    public function update(UpdateMunicipalityDto $dto, $slug): Municipality
    {
        $municipality = Municipality::findOrFail($dto->id);

        $municipality->update([
            'name' => $dto->name,
            'municipal_code' => $dto->code,
            'zip_code' => $dto->zipCode,
            'slug' => $slug,
            'is_active' => $dto->isActive,
        ]);

        return $municipality;
    }

    public function findById(string $municipalityId): ?Municipality
    {

        return Municipality::where('id', $municipalityId)
            ->first();
    }

    public function findByCode(string $code, ?string $ignoreId = null): ?Municipality
    {
        //if code is 4905 and id is 1 for updating
        $query = Municipality::where('municipal_code', $code);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->first();
    }

    public function findByName(string $name, ?string $ignoreId = null)
    {
        $query = Municipality::where('name', $name);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->first();
    }
    public function findByZipCode(string $zipCode, ?string $ignoreId = null)
    {
        $query = Municipality::where('zip_code', $zipCode);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return $query->first();
    }

    public function getAll(): Collection
    {
        return Municipality::all();
    }

    public function getActiveStatus(): Collection
    {
        return Municipality::where('is_active', true)
            ->get();
    }

    public function findBySlug(string $slug, bool $isActive): ?Municipality
    {
        return Municipality::where('slug', $slug)
            ->where('is_active', $isActive)
            ->first();
    }
}
