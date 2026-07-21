<?php

namespace Database\Seeders;

use App\Core\ActionCenter\Models\DocumentType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

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
        $this->reconcileLegacyDocumentKey(
            'cert_indigency',
            'indigency_or_need_certificate',
        );

        $documents = [
            [
                'key' => 'valid_id_front',
                'label' => 'Filer Valid Government ID - Front',
                'description' => 'Harapang bahagi ng balidong government-issued ID ng nasa hustong gulang na naghahain ng kahilingan ng tulong.',
                'examples' => 'Philsys ID, Voter\'s ID, Driver\'s License, Passport, Senior Citizen ID',
                'sort_order' => 10,
            ],
            [
                'key' => 'valid_id_back',
                'label' => 'Filer Valid Government ID - Back',
                'description' => 'Likurang bahagi ng parehong balidong government-issued ID ng naghahain ng kahilingan ng tulong.',
                'examples' => 'Back side of the same ID uploaded for the filer',
                'sort_order' => 11,
            ],
            [
                'key' => 'recipient_valid_id_front',
                'label' => 'Assisted Person Valid Government ID - Front',
                'description' => 'Harapang bahagi ng balidong government-issued ID ng nasa hustong gulang na tatanggap ng tulong para sa kahilingang inihain ng ibang tao.',
                'examples' => 'Required for an adult assisted person when available',
                'sort_order' => 12,
            ],
            [
                'key' => 'recipient_valid_id_back',
                'label' => 'Assisted Person Valid Government ID - Back',
                'description' => 'Likurang bahagi ng parehong balidong government-issued ID ng nasa hustong gulang na tatanggap ng tulong.',
                'examples' => 'Back side of the same ID uploaded for the assisted person',
                'sort_order' => 13,
            ],
            [
                'key' => 'indigency_or_need_certificate',
                'label' => 'Certificate of Indigency / Certificate of Need',
                'description' => 'Orihinal na Certificate of Indigency mula sa barangay o katumbas na sertipikong nagpapatunay na nangangailangan ng tulong ang non-indigent na aplikante.',
                'examples' => 'Barangay Certificate of Indigency or Certificate of Need issued within the last 3 months',
                'sort_order' => 20,
            ],
            [
                'key' => 'brgy_clearance',
                'label' => 'Barangay Clearance',
                'description' => 'Sertipiko mula sa barangay na nagpapatunay sa paninirahan at mabuting asal ng aplikante.',
                'examples' => 'Standard Barangay Clearance',
                'sort_order' => 30,
            ],
            [
                'key' => 'med_abstract',
                'label' => 'Medical Certificate / Medical Abstract',
                'description' => 'Orihinal na Medical Certificate o Medical Abstract na naglalaman ng diagnosis o buod ng rekord medikal ng pasyente mula sa lisensiyadong doktor.',
                'examples' => 'Medical Certificate, Clinical Abstract with PRC number and signature',
                'sort_order' => 40,
            ],
            [
                'key' => 'medical_supporting_document',
                'label' => 'Reseta ng Doktor / Hospital Bill / Laboratory Request',
                'description' => 'Magpasa ng alinman sa Reseta ng Doktor, Hospital Bill, o Laboratory Request. Dapat ay orihinal na kopya o Certified True Copy.',
                'examples' => 'Doctor\'s Prescription, Hospital Bill, or Laboratory Request',
                'sort_order' => 45,
            ],
            [
                'key' => 'doctor_prescription',
                'label' => 'Doctor\'s Prescription (Reseta ng Doktor)',
                'description' => 'Reseta mula sa lisensiyadong doktor na nagsasaad ng mga gamot o gamutang kailangan ng pasyente.',
                'examples' => 'Signed prescription showing the physician\'s name and PRC or license number',
                'sort_order' => 46,
            ],
            [
                'key' => 'hospital_bill',
                'label' => 'Hospital Bill / Statement of Account',
                'description' => 'Opisyal na billing statement mula sa ospital o klinika na nagpapakita ng halagang kailangan pang bayaran.',
                'examples' => 'SOA from Hospital, Promissory Note, Outstanding Pharmacy Quotation',
                'sort_order' => 50,
            ],
            [
                'key' => 'death_cert',
                'label' => 'Registered Death Certificate',
                'description' => 'Opisyal na dokumento mula sa Local Civil Registrar na nagpapatunay sa pagkamatay ng isang tao.',
                'examples' => 'PSA Death Certificate, LCR Certified True Copy',
                'sort_order' => 60,
            ],
            [
                'key' => 'funeral_contract',
                'label' => 'Funeral Contract',
                'description' => 'Pormal na kasunduan na naglalaman ng halaga at mga serbisyong ibibigay ng punerarya.',
                'examples' => 'Contract of Services from Funeral Home, Official Receipt of Embalming',
                'sort_order' => 70,
            ],
            [
                'key' => 'cert_enrollment',
                'label' => 'Certificate of Enrollment',
                'description' => 'Opisyal na dokumento mula sa paaralan na nagpapatunay na kasalukuyang naka-enroll ang estudyante sa kasalukuyang termino o taon ng pag-aaral.',
                'examples' => 'Certificate of Enrollment, Registration Form, Matriculation Receipt',
                'sort_order' => 80,
            ],
            [
                'key' => 'report_card',
                'label' => 'Report Card / Grade Slip',
                'description' => 'Opisyal na rekord mula sa paaralan na nagpapakita ng mga marka ng estudyante sa nakaraang termino.',
                'examples' => 'Form 138 (Elementary/Senior High), Transcript of Records (College)',
                'sort_order' => 90,
            ],
        ];

        foreach ($documents as $doc) {
            // Fix: match on `key`, not `label` — key is the stable machine identifier.
            DocumentType::updateOrCreate(
                ['key' => $doc['key']],
                [
                    'label' => $doc['label'],
                    'description' => $doc['description'],
                    'examples' => $doc['examples'],
                    'sort_order' => $doc['sort_order'],
                    'is_active' => true,
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

    private function reconcileLegacyDocumentKey(string $legacyKey, string $canonicalKey): void
    {
        DB::transaction(function () use ($legacyKey, $canonicalKey): void {
            $documents = DocumentType::query()
                ->whereIn('key', [$legacyKey, $canonicalKey])
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('key');

            $legacy = $documents->get($legacyKey);

            if (!$legacy) {
                return;
            }

            $canonical = $documents->get($canonicalKey);

            if (!$canonical) {
                $legacy->update(['key' => $canonicalKey]);

                return;
            }

            $legacyAssignments = DB::table('ac_assistance_type_documents')
                ->where('document_type_id', $legacy->id)
                ->get();

            foreach ($legacyAssignments as $legacyAssignment) {
                $canonicalAssignment = DB::table('ac_assistance_type_documents')
                    ->where('assistance_type_id', $legacyAssignment->assistance_type_id)
                    ->where('document_type_id', $canonical->id)
                    ->first();

                if (!$canonicalAssignment) {
                    DB::table('ac_assistance_type_documents')
                        ->where('id', $legacyAssignment->id)
                        ->update([
                            'document_type_id' => $canonical->id,
                            'updated_at' => now(),
                        ]);

                    continue;
                }

                DB::table('ac_assistance_type_documents')
                    ->where('id', $canonicalAssignment->id)
                    ->update([
                        'is_required' => (bool) $canonicalAssignment->is_required
                            || (bool) $legacyAssignment->is_required,
                        'sort_order' => min(
                            $canonicalAssignment->sort_order,
                            $legacyAssignment->sort_order,
                        ),
                        'updated_at' => now(),
                    ]);

                DB::table('ac_assistance_type_documents')
                    ->where('id', $legacyAssignment->id)
                    ->delete();
            }

            $legacy->delete();
        });

        Media::query()
            ->where('custom_properties->document_key', $legacyKey)
            ->get()
            ->each(function (Media $media) use ($canonicalKey): void {
                $media->setCustomProperty('document_key', $canonicalKey);
                $media->save();
            });
    }
}
