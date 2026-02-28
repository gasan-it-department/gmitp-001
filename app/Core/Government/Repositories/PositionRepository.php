<?php

namespace App\Core\Government\Repositories;

use Illuminate\Support\Facades\DB;

class PositionRepository
{

    public function getAll()
    {

        return DB::table('positions')
            ->orderBy('sequence', 'asc')
            ->get();

    }

}