<?php

namespace Database\Seeders;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AssistanceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $gasan = Municipality::where('name', 'GASAN')->first();

        if (!$gasan) {
            $this->command->warn('Municipalities not found! Run your MunicipalitySeeder first.');
            return;
        }

        $program = [
            [
                'name' => 'Medical Assistance',
                'description' => 'Financial aid for hospital bills, medicines, and medical procedures.',
                'required_documents' => ['valid_id', 'medical_abstract', 'barangay_indigency', 'hospital_bill'],
            ],
            [
                'name' => 'Burial Assistance',
                'description' => 'Financial aid for funeral and burial expenses of a deceased family member.',
                'required_documents' => ['valid_id', 'death_certificate', 'funeral_contract', 'barangay_indigency'],
            ],
            [
                'name' => 'Educational Assistance',
                'description' => 'Cash aid for indigent students.',
                'required_documents' => ['valid_id', 'school_id', 'certificate_of_enrollment', 'grades'],
            ],
        ];
        foreach ($program as $prog) {
            AssistanceType::create(array_merge(
                $prog,
                [
                    'municipal_id' => $gasan->id,
                    'is_active' => true,
                ]
            ));
        }

    }
}
