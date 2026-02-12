<?php

namespace App\Core\Government\Repositories;

use Illuminate\Support\Facades\DB;
use App\Core\Government\Dto\TermDto;
use App\Core\Government\Models\Term;

class TermRepository
{

    public function save(string $termId, TermDto $dto)
    {

        // if ($dto->isCurrent) {
        //     Term::where('municipal_id', $dto->municipalId)
        //         ->update(['is_current' => false]);
        // }

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

    public function markAllAsInactive(string $municipalId)
    {

        DB::table('terms')
            ->where('municipal_id', $municipalId)
            ->where('is_current', true)
            ->update(['is_current' => false]);

    }

    public function update(string $termId, TermDto $dto)
    {

        DB::table('terms')
            ->where('id', $termId)
            ->update([

                'name' => $dto->name,

                'statutory_start' => $dto->statutoryStart,

                'statutory_end' => $dto->statutoryEnd,

                'is_current' => $dto->isCurrent,

                'updated_at' => now(),

            ]);

    }

    public function getByMunicipality(string $municipalId)
    {

        return Term::where('municipal_id', $municipalId)
            ->orderBy('created_at', 'desc')
            ->get();

    }

    public function exists(string $municipalId, string $name, string $start, string $end)
    {

        return Term::where('municipal_id', $municipalId)
            ->where('name', $name)
            ->where('statutory_start', $start)
            ->where('statutory_end', $end)
            ->exists();

    }

    public function findById(string $termId)
    {

        return Term::find($termId);

    }


}