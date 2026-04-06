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
            ['code' => 'MAO', 'name' => 'Municipal Accounting Office'],
            ['code' => 'MTO', 'name' => 'Municipal Treasurer\'s Office'],
            ['code' => 'MASSO', 'name' => 'Municipal Assessor\'s Office'],
            ['code' => 'MEO', 'name' => 'Municipal Engineering Office'],
            ['code' => 'MHO', 'name' => 'Municipal Health Office'],
            ['code' => 'MSWDO', 'name' => 'Municipal Social Welfare and Development Office'],
            ['code' => 'MAgO', 'name' => 'Municipal Agriculture Office'],
            ['code' => 'GSO', 'name' => 'General Services Office'],
            ['code' => 'HRMO', 'name' => 'Human Resource Management Office'],
            ['code' => 'MDRRMO', 'name' => 'Municipal Disaster Risk Reduction and Management Office'],
        ];

        $municipalities = Municipality::first();

        foreach ($departments as $dept) {
            Department::updateOrCreate(
                ['code' => $dept['code']],
                ['name' => $dept['name'], 'is_active' => true, 'municipal_id' => $municipalities->id]
            );
        }

    }
}
