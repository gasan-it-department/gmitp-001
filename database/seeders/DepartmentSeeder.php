<?php

namespace Database\Seeders;

use App\Core\Department\Models\Department;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            ['code' => 'OM', 'name' => 'Office of the Mayor'],
            ['code' => 'MPDO', 'name' => 'Municipal Planning and Development Office'],
            ['code' => 'MBO', 'name' => 'Municipal Budget Office'],
            ['code' => 'ACCTG', 'name' => 'Municipal Accounting Office'],
            ['code' => 'MTO', 'name' => 'Municipal Treasurer\'s Office'],
            ['code' => 'MASSO', 'name' => 'Municipal Assessor\'s Office'],
            ['code' => 'MEO', 'name' => 'Municipal Engineering Office'],
            ['code' => 'RHU', 'name' => 'Municipal Rural Health Office'],
            ['code' => 'MSWDO', 'name' => 'Municipal Social Welfare and Development Office'],
            ['code' => 'MAO', 'name' => 'Municipal Agriculture Office'],
            ['code' => 'GSO', 'name' => 'General Services Office'],
            ['code' => 'HRMO', 'name' => 'Human Resource Management Office'],
            ['code' => 'MDRRMO', 'name' => 'Municipal Disaster Risk Reduction and Management Office'],
            ['code' => 'BPLO', 'name' => 'BUSINESS PERMITS & LICENSING OFFICE'],
            ['code' => 'HR', 'name' => 'HUMAN RESOURCE MANAGEMENT OFFICE'],
            ['code' => 'PIO', 'name' => 'PUBLIC INFORMATION OFFICE'],
            ['code' => 'TCAO', 'name' => 'TOURISM CULTURE & ARTS OFFICE'],
            ['code' => 'MO', 'name' => 'MARKET OFFICE'],
            ['code' => 'SO', 'name' => 'SLAUGHTERHOUSE OFFICE'],
            ['code' => 'OVM', 'name' => 'OFFICE OF THE VICE MAYOR'],
            ['code' => 'SB', 'name' => 'OFFICE OF THE SANGUNIANG BAYAN'],
            ['code' => 'SECRETARY TO THE SANGUNIANG BAYAN', 'name' => 'SECRETARY TO THE SANGUNIANG BAYAN'],
            ['code' => 'MCR', 'name' => 'MUNICIPAL CIVIL REGISTRAR OFFICE'],
            ['code' => 'WATERWORKS', 'name' => 'WATERWORKS'],
            ['code' => 'CEMETERY OFFICE', 'name' => 'CEMETERY OFFICE'],
        ];

        $municipalities = Municipality::all();

        foreach ($municipalities as $municipality) {
            foreach ($departments as $dept) {
                Department::updateOrCreate(
                    [
                        'code' => $dept['code'],
                        'municipal_id' => $municipality->id
                    ],
                    [
                        'name' => $dept['name'],
                        'is_active' => true,
                    ]
                );
            }
        }

    }
}
