<?php

namespace App\Core\Tourism\UseCase\Category;

use App\Core\Tourism\Models\Category;

class GetFilteredCategories
{
    public function execute(string $municipalId)
    {

        return Category::where('municipal_id', $municipalId)
            ->get();

    }
}