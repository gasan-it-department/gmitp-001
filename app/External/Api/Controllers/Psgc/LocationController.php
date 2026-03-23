<?php

namespace App\External\Api\Controllers\Psgc;

use App\Http\Controllers\Controller;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class LocationController extends Controller
{

    public function regions()
    {
        return DB::table('psgc_regions')
            ->orderBy('name')
            ->get(['id', 'psgc_code', 'name']);
    }

    public function provinces(string $regionId)
    {
        return DB::table('psgc_provinces')
            ->where('region_id', $regionId)
            ->orderBy('name')
            ->get(['id', 'psgc_code', 'name']);
    }

    public function municipalities(string $provinceId)
    {

        return DB::table('psgc_municipalities')
            ->where('province_id', $provinceId)
            ->orderBy('name')
            ->get(['id', 'psgc_code', 'name', 'is_city']);
    }

    public function municipalitiesByRegion(string $regionId)
    {
        return DB::table('psgc_municipalities')
            ->where('region_id', $regionId)
            ->whereNull('province_id') // Strict check to only pull independent cities
            ->orderBy('name')
            ->get(['id', 'psgc_code', 'name', 'is_city']);
    }

    public function barangays(string $municipalId)
    {
        return DB::table('psgc_barangays')
            ->where('municipality_id', $municipalId) // Fixed from municipality_code
            ->orderBy('name')
            ->get(['id', 'psgc_code', 'name']);
    }


}