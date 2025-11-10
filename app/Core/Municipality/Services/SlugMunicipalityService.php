<?php

namespace App\Core\Municipality\Services;

use Illuminate\Support\Str;

class SlugMunicipalityService
{
    public function slugMunicipality(string $name, string $zipCode): string
    {
        $slugBase = $name . '-' . $zipCode;

        return Str::slug($slugBase);
    }
}