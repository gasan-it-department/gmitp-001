<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\AppointOfficialDto;
use App\Core\Government\Models\OfficialTerm;
use Illuminate\Support\Facades\DB;

class OfficialTermRepository
{

    public function appoint(AppointOfficialDto $dto, string $appointRecordId)
    {
        return OfficialTerm::create([
            'id' => $appointRecordId,
            'municipal_id' => $dto->municipalId,
            'term_id' => $dto->termId,
            'official_id' => $dto->officialId,
            'position_id' => $dto->positionId,
            'actual_start_date' => $dto->actualStartDate,
        ]);

    }

    public function getRosterByTerm(string $termId)
    {

        return OfficialTerm::query()
            ->with(['official', 'term'])
            ->where('term_id', $termId)
            ->get();

    }

    public function existsInTerm(string $officialId, string $termId)
    {
        return OfficialTerm::query()
            ->where('official_id', $officialId)
            ->where('term_id', $termId)
            ->exists();

    }

    public function delete(string $id, string $municipalId)
    {

        return OfficialTerm::query()
            ->where('municipal_id', $municipalId)
            ->findOrFail($id)
            ->delete();

    }

}