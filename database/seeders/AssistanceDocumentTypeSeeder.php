<?php

namespace Database\Seeders;

use App\Core\ActionCenter\Models\DocumentType;
use Illuminate\Database\Seeder;

class AssistanceDocumentTypeSeeder extends Seeder
{
    /**
     * Master list of all document types used across assistance programs.
     *
     * key        — machine identifier; referenced by ac_assistance_type_documents
     *              and used as the upload field key on the citizen apply form.
     * sort_order — global display order (per-program order is set on the pivot).
     */
    public function run(): void
    {
        $documents = [
            [
                'key'         => 'valid_id_front',
                'label'       => 'Filer Valid Government ID - Front',
                'description' => 'The front side of the valid government ID belonging to the adult filing the request.',
                'examples'    => 'Philsys ID, Voter\'s ID, Driver\'s License, Passport, Senior Citizen ID',
                'sort_order'  => 10,
            ],
            [
                'key'         => 'valid_id_back',
                'label'       => 'Filer Valid Government ID - Back',
                'description' => 'The back side of the valid government ID belonging to the adult filing the request.',
                'examples'    => 'Back side of the same ID uploaded for the filer',
                'sort_order'  => 11,
            ],
            [
                'key'         => 'recipient_valid_id_front',
                'label'       => 'Assisted Person Valid Government ID - Front',
                'description' => 'The front side of the assisted adult\'s valid government ID for an on-behalf request.',
                'examples'    => 'Required for an adult assisted person when available',
                'sort_order'  => 12,
            ],
            [
                'key'         => 'recipient_valid_id_back',
                'label'       => 'Assisted Person Valid Government ID - Back',
                'description' => 'The back side of the assisted adult\'s valid government ID for an on-behalf request.',
                'examples'    => 'Back side of the same ID uploaded for the assisted person',
                'sort_order'  => 13,
            ],
            [
                'key'         => 'cert_indigency',
                'label'       => 'Certificate of Indigency',
                'description' => 'An official document from the Barangay certifying the financial status of the applicant.',
                'examples'    => 'Barangay Certificate of Indigency (must be issued within the last 3 months)',
                'sort_order'  => 20,
            ],
            [
                'key'         => 'brgy_clearance',
                'label'       => 'Barangay Clearance',
                'description' => 'A certificate establishing the residency and good moral character of the applicant.',
                'examples'    => 'Standard Barangay Clearance',
                'sort_order'  => 30,
            ],
            [
                'key'         => 'med_abstract',
                'label'       => 'Medical Abstract / Certificate',
                'description' => 'A formal summary of a patient\'s medical records or diagnosis provided by a licensed physician.',
                'examples'    => 'Medical Certificate, Clinical Abstract with PRC number and signature',
                'sort_order'  => 40,
            ],
            [
                'key'         => 'hospital_bill',
                'label'       => 'Hospital Bill / Statement of Account',
                'description' => 'An official billing statement from a hospital or clinic showing outstanding balances.',
                'examples'    => 'SOA from Hospital, Promissory Note, Outstanding Pharmacy Quotation',
                'sort_order'  => 50,
            ],
            [
                'key'         => 'death_cert',
                'label'       => 'Registered Death Certificate',
                'description' => 'An official document issued by the Local Civil Registrar confirming the death of an individual.',
                'examples'    => 'PSA Death Certificate, LCR Certified True Copy',
                'sort_order'  => 60,
            ],
            [
                'key'         => 'funeral_contract',
                'label'       => 'Funeral Contract',
                'description' => 'A formal agreement outlining the costs and services provided by a funeral parlor.',
                'examples'    => 'Contract of Services from Funeral Home, Official Receipt of Embalming',
                'sort_order'  => 70,
            ],
            [
                'key'         => 'cert_enrollment',
                'label'       => 'Certificate of Enrollment',
                'description' => 'An official document from the school confirming the student\'s active enrollment for the current term.',
                'examples'    => 'Certificate of Enrollment, Registration Form, Matriculation Receipt',
                'sort_order'  => 80,
            ],
            [
                'key'         => 'report_card',
                'label'       => 'Report Card / Grade Slip',
                'description' => 'Official academic record showing the student\'s grades for the previous term.',
                'examples'    => 'Form 138 (Elementary/Senior High), Transcript of Records (College)',
                'sort_order'  => 90,
            ],
        ];

        foreach ($documents as $doc) {
            // Fix: match on `key`, not `label` — key is the stable machine identifier.
            DocumentType::updateOrCreate(
                ['key' => $doc['key']],
                [
                    'label'       => $doc['label'],
                    'description' => $doc['description'],
                    'examples'    => $doc['examples'],
                    'sort_order'  => $doc['sort_order'],
                    'is_active'   => true,
                ]
            );
        }

        // Preserve legacy request media tagged with `valid_id`, but stop
        // offering the old single-file slot for new assistance requests.
        DocumentType::query()
            ->where('key', 'valid_id')
            ->update(['is_active' => false]);

        $this->command->info('AssistanceDocumentTypeSeeder: ' . count($documents) . ' document types seeded.');
    }
}
