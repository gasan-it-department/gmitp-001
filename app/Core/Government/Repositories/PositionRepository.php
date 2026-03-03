<?php

namespace App\Core\Government\Repositories;

use App\Core\Government\Models\Position;
use Illuminate\Support\Facades\DB;

class PositionRepository
{

    public function getAll()
    {

        return DB::table('positions')
            ->orderBy('sequence', 'asc')
            ->get();

    }

    public function getPublicRosterForTerm(string $municipalId, string $termId)
    {
        return Position::query()
            ->with([
                'appointments' => function ($query) use ($termId, $municipalId) {
                    $query->where('municipal_id', $municipalId)
                        ->where('term_id', $termId)
                        ->whereNull('actual_end_date')
                        ->with('official');
                }
            ])
            ->orderBy('sequence', 'asc')
            ->get();
    }

}