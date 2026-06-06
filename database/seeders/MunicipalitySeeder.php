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
        $towns = [
            ['name' => 'Boac', 'zip' => '4900'],
            ['name' => 'Buenavista', 'zip' => '4901'],
            ['name' => 'Santa Cruz', 'zip' => '4902'],
            ['name' => 'Torrijos', 'zip' => '4903'],
            ['name' => 'Gasan', 'zip' => '4905'],
        ];

        foreach ($towns as $town) {
            $psgc = DB::table('psgc_municipalities')
                ->where('name', $town['name'])
                ->first();

            if (!$psgc) {
                continue;
            }

            Municipality::firstOrCreate(
                ['psgc_municipal_id' => $psgc->id],
                [
                    'id' => Str::ulid(),
                    'name' => strtoupper($psgc->name),
                    'slug' => Str::slug($psgc->name) . '-' . $town['zip'],
                    'municipal_code' => $psgc->psgc_code,
                    'zip_code' => $town['zip'],
                    'is_active' => true,
                ]
            );
        }
    }
}
