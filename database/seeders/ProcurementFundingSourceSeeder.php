<?php

namespace Database\Seeders;

use App\Core\Procurement\Models\ProcurementFundingSource;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProcurementFundingSourceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $sources = [
            [
                'name' => 'General Fund (GF)',
                'code' => 'GF',
                'type' => 'General',
                'is_active' => true,
            ],
            [
                'name' => 'Special Education Fund (SEF)',
                'code' => 'SEF',
                'type' => 'Special',
                'is_active' => true,
            ],
            [
                'name' => '20% Development Fund',
                'code' => '20-DF',
                'type' => 'Development',
                'is_active' => true,
            ],
            [
                'name' => 'Local Disaster Risk Reduction and Management Fund (LDRRMF)',
                'code' => 'LDRRMF',
                'type' => 'Calamity',
                'is_active' => true,
            ],
            [
                'name' => 'Gender and Development (GAD) Fund',
                'code' => 'GAD',
                'type' => 'Special',
                'is_active' => true,
            ],
            [
                'name' => 'Trust Fund',
                'code' => 'TF',
                'type' => 'Trust',
                'is_active' => true,
            ],
            [
                'name' => 'Continuity Appropriation',
                'code' => 'CON-APP',
                'type' => 'Supplemental',
                'is_active' => true,
            ],
        ];

        foreach ($sources as $source) {
            ProcurementFundingSource::updateOrCreate(
                ['code' => $source['code']], // Prevent duplicates if run twice
                $source
            );
        }
    }
}
