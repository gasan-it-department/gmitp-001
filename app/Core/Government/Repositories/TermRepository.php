<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\AddTermDto;
use App\Core\Government\Models\Term;

class TermRepository
{

    public function save(string $termId, AddTermDto $dto)
    {

        if ($dto->isCurrent) {
            Term::where('municipal_id', $dto->municipalId)
                ->update(['is_current' => false]);
        }

        $term = Term::Create([

            'id' => $termId,

            'name' => $dto->name,

            'statutory_start' => $dto->statutoryStart,

            'statutory_end' => $dto->statutoryEnd,

            'is_current' => $dto->isCurrent,

            'municipal_id' => $dto->municipalId,

        ]);

        return $term;

    }

    public function getByMunicipality(string $municipalId)
    {

        return Term::where('municipal_id', $municipalId)->get();

    }


}