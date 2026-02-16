<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\AddOfficialDto;
use App\Core\Government\Dto\AppointOfficialDto;
use App\Core\Government\Models\Official;
use Illuminate\Support\Facades\DB;

class OfficialRepository
{

    public function addOfficial(AddOfficialDto $dto, string $officialId)
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
        ]);

    }

    public function appoint(AppointOfficialDto $dto, string $appointRecordId, $officialId)
    {

        DB::table('official_terms')->insert([
            'id',
            'municipal_id',
            'term_id',
            'official_id',
            'position_id',
            'actual_start_date',
            'actual_end_date',
            'status',
            'political_party',
            'profile_url',
            'profile_public_id',
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

        return DB::table('officials')
            ->where('municipal_id', $municipalId)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%")
                    ->orWhere('middle_name', 'like', "%{$query}%");
            })
            ->limit(10)
            ->orderBy('last_name', 'asc')
            ->get(['id', 'first_name', 'last_name', 'middle_name']);
    }

}