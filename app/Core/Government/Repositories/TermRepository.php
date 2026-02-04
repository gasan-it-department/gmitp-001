<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Dto\AddTermDto;
use App\Core\Government\Models\Term;

class TermRepository
{

    public function save(string $termId, AddTermDto $dto)
    {

        if ($dto->isCurrent) {
            Term::query()->update(['is_current' => false]);
        }

        Term::Create([

            'id' => $termId,

            'name' => $dto->name,

            'statutory_date' => $dto->statutoryStart,

            'statutory_end' => $dto->statutoryEnd,

            'is_current' => $dto->isCurrent,

        ]);

    }

}