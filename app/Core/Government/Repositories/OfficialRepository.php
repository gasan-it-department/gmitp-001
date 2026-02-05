<?php

namespace App\Core\Government\Officials\Repositories;

use App\Core\Government\Dto\AppointOfficialDto;
use Illuminate\Support\Facades\DB;

class OfficialRepositories
{

    public function createProfile(AppointOfficialDto $dto, string $officialId)
    {

        DB::table('officials')->insert([
            'id' => $officialId,
            'first_name' => $dto->firstName,
            'last_name' => $dto->lastName,
            'middle_name' => $dto->middleName,
            'suffix' => $dto->suffix,
            'gender' => $dto->gender,
            'municipal_id' => $dto->municipalId,
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

}