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

            ['name' => 'MUNICIPAL SOCIAL WELFARE AND DEVELOPMENT OFFICE (MSWDO)', 'description' => null], //
            ['name' => 'SANGGUNIANG BAYAN', 'description' => null], //
            ['name' => 'RURAL HEALTH OFFICE (RHU)', 'description' => null], //
            ['name' => 'MUNICIPAL AGRICULTURE OFFICE (MAO)', 'description' => null], //
            ['name' => 'MUNICIPAL TREASURER\'S OFFICE (MTO)', 'description' => null], //
            ['name' => 'MUNICIPAL ASSESSOR\'S OFFICE (MAO)', 'description' => null], //
            ['name' => 'MUNICIPAL CIVIL REGISTRAR\'S OFFICE (MCRO)', 'description' => null], //
            ['name' => 'MUNICIPAL TOURISM OFFICE', 'description' => null], //
            
            // ['name' => 'MUNICIPAL INFORMATION AND COMMUNICATIONS TECHNOLOGY OFFICE (MICTO)', 'description' => null],
            // ['name' => 'MUNICIPAL ENVIRONMENT AND NATURAL RESOURCES OFFICE (MENRO)', 'description' => null],
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