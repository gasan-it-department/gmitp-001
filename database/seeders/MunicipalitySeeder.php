<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Core\Municipality\Models\Municipality;
class MunicipalitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $municipalities = [
            [
                'name' => 'Gasan',
                'slug' => 'gasan-4905',
                'municipal_code' => '174003000',
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
