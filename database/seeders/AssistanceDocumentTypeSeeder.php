<?php

namespace Database\Seeders;

use App\Core\ActionCenter\Models\DocumentType;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AssistanceDocumentTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $documents = [
            [
                'key' => 'valid_id',
                'label' => 'Valid Government ID',
                'description' => 'A valid, unexpired identification card issued by the Philippine government.',
                'examples' => 'Philsys ID, Voter\'s ID, Driver\'s License, Passport, Senior Citizen ID',
                'sort_order' => 10,
            ],
            [
                'key' => 'cert_indigency',
                'label' => 'Certificate of Indigency',
                'description' => 'An official document from the Barangay proving the financial status of the applicant.',
                'examples' => 'Barangay Certificate of Indigency (Must be issued within the last 3 months)',
                'sort_order' => 20,
            ],
            [
                'key' => 'brgy_clearance',
                'label' => 'Barangay Clearance',
                'description' => 'A certificate establishing the residency and good moral character of the applicant.',
                'examples' => 'Standard Barangay Clearance',
                'sort_order' => 30,
            ],
            [
                'key' => 'med_abstract',
                'label' => 'Medical Abstract / Certificate',
                'description' => 'A formal summary of a patient\'s medical records or diagnosis provided by a licensed physician.',
                'examples' => 'Medical Certificate, Clinical Abstract with PRC number and signature',
                'sort_order' => 40,
            ],
            [
                'key' => 'hospital_bill',
                'label' => 'Hospital Bill / Statement of Account',
                'description' => 'An official billing statement from a hospital or clinic showing outstanding balances.',
                'examples' => 'SOA from Hospital, Promissory Note, Outstanding Pharmacy Quotation',
                'sort_order' => 50,
            ],
            [
                'key' => 'death_cert',
                'label' => 'Registered Death Certificate',
                'description' => 'An official document issued by the Local Civil Registrar confirming the death of an individual.',
                'examples' => 'PSA Death Certificate, LCR Certified True Copy',
                'sort_order' => 60,
            ],
            [
                'key' => 'funeral_contract',
                'label' => 'Funeral Contract',
                'description' => 'A formal agreement outlining the costs and services provided by a funeral parlor.',
                'examples' => 'Contract of Services from Funeral Home, Official Receipt of Embalming',
                'sort_order' => 70,
            ],
        ];

        foreach ($documents as $doc) {
            DocumentType::updateOrCreate(
                ['key' => $doc['label']],
                [
                    'label' => $doc['label'],
                    'description' => $doc['description'],
                    'examples' => $doc['examples'],
                    'sort_order' => $doc['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
