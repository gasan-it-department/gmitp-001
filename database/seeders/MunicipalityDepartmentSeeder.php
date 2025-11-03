<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Shared\Models\MunicipalityDepartment;
use Illuminate\Support\Str;

class MunicipalityDepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['name' => 'OFFICE OF THE MAYOR (OM)', 'description' => null],
            ['name' => 'OFFICE OF THE VICE MAYOR (OVM)', 'description' => null],
            ['name' => 'BUSINESS PERMITS AND LICENSING OFFICE (BPLO)', 'description' => null],
            ['name' => 'ENGINEERING OFFICE', 'description' => null],
            ['name' => 'MUNICIPAL PLANNING AND DEVELOPMENT OFFICE (MPDO)', 'description' => null],
        ];

        foreach ($departments as $data) {
            MunicipalityDepartment::create([
                'id' => (string) Str::ulid(),
                'name' => $data['name'],
                'description' => $data['description'],
            ]);
        }
    }
}