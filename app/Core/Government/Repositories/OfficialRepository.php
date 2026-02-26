<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\AddOfficialDto;
use App\Core\Government\Dto\AppointOfficialDto;
use App\Core\Government\Models\Official;
use Illuminate\Support\Facades\DB;

class OfficialRepository
{

    public function addOfficial(AddOfficialDto $dto, string $officialId, ?string $profileUrl, ?string $imgPublicId)
    {

        return Official::create([
            'id' => $officialId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'gender' => $dto->gender,
            'municipal_id' => $dto->municipalId,
            'biography' => $dto->biography,
            'profile_url' => $profileUrl,
            'profile_public_id' => $imgPublicId,
        ]);

    }

    public function getAll(string $municipalId)
    {

        $query = Official::query();

        if ($municipalId) {
            $query->where('municipal_id', $municipalId);

        }

        return $query->get();

    }

    public function search(string $query, string $municipalId)
    {
        $terms = array_filter(explode(' ', trim($query)));

        return Official::query()
            ->where('municipal_id', $municipalId) // Don't forget the tenant isolation!
            ->where(function ($q) use ($terms) {
                foreach ($terms as $term) {
                    $q->where(function ($sub) use ($term) {
                        $sub->where('first_name', 'like', "%{$term}%")
                            ->orWhere('last_name', 'like', "%{$term}%")
                            ->orWhere('middle_name', 'like', "%{$term}%");
                    });
                }
            })
            ->orderBy('last_name', 'asc')
            ->limit(10)
            ->get();
    }
}