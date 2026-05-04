<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Support\Facades\DB;

class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $psgcMunicipal = DB::table('psgc_municipalities')
            ->where('name', 'Gasan')
            ->first();

        $municipalities = [
            [
                'name' => strtoupper($psgcMunicipal->name),
                'psgc_municipal_id' => $psgcMunicipal->id,
                'slug' => 'gasan-4905',
                'municipal_code' => $psgcMunicipal->psgc_code,
                'zip_code' => '4905',
                'is_active' => true,
            ],
            // Add more municipalities as needed
        ];

        foreach ($municipalities as $data) {
            Municipality::create(array_merge($data, ['id' => Str::ulid()]));
        }
    }
}
