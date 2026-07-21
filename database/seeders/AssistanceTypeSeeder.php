<?php

namespace Database\Seeders;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\DocumentType;
use App\Core\Municipality\Models\Municipality;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AssistanceTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Execution order:
     *   MunicipalitySeeder → AssistanceDocumentTypeSeeder → AssistanceTypeSeeder
     *
     * What this seeder does:
     *   1. Creates / updates the 5 standard assistance programs for GASAN.
     *   2. Upserts the ac_assistance_type_documents pivot so each program is
     *      linked to its required and optional documents in display order.
     *
     * Idempotent — safe to re-run; existing rows are updated, not duplicated.
     */
    public function run(): void
    {
        $municipality = Municipality::where('name', 'GASAN')->first();

        if (!$municipality) {
            $this->command->warn('Municipality "GASAN" not found. Run MunicipalitySeeder first.');
            return;
        }

        // Pre-load all document types so we can resolve keys without N+1 queries.
        $docTypes = DocumentType::all()->keyBy('key');

        // Guard: every document key referenced below must already exist.
        $allDocKeys = collect($this->programs())
            ->flatMap(fn(array $p) => collect($p['documents'])->pluck('key'))
            ->unique();

        $missing = $allDocKeys->filter(fn(string $k) => !$docTypes->has($k));

        if ($missing->isNotEmpty()) {
            $this->command->error(
                'Missing document types: ' . $missing->join(', ') .
                '. Run AssistanceDocumentTypeSeeder first.'
            );
            return;
        }

        $now = now();

        foreach ($this->programs() as $program) {
            $pivotRows = $program['documents'];
            $typeData = array_diff_key($program, ['documents' => null]);

            // --- Create or update the assistance type ---
            $type = AssistanceType::updateOrCreate(
                [
                    'municipal_id' => $municipality->id,
                    'slug' => $typeData['slug'],
                ],
                array_merge($typeData, [
                    'municipal_id' => $municipality->id,
                    'is_active' => true,
                ])
            );

            // Retire the old one-file ID requirement for this seeded program.
            // Existing request media remains untouched and readable.
            $legacyValidId = $docTypes->get('valid_id');
            if ($legacyValidId) {
                DB::table('ac_assistance_type_documents')
                    ->where('assistance_type_id', $type->id)
                    ->where('document_type_id', $legacyValidId->id)
                    ->delete();
            }

            // --- Upsert the pivot (ac_assistance_type_documents) ---
            // The pivot has its own ULID primary key, so we cannot use attach() /
            // sync() directly. We use DB::upsert() instead:
            //   • INSERT  → generates a new ULID id + all columns
            //   • UPDATE  → refreshes is_required, sort_order, updated_at only
            //               (id and created_at are intentionally excluded from the
            //                update list so existing rows are not re-keyed)
            foreach ($pivotRows as $row) {
                DB::table('ac_assistance_type_documents')->upsert(
                    [
                        'id' => (string) Str::ulid(),
                        'assistance_type_id' => $type->id,
                        'document_type_id' => $docTypes->get($row['key'])->id,
                        'is_required' => $row['is_required'],
                        'sort_order' => $row['sort_order'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ],
                    ['assistance_type_id', 'document_type_id'], // conflict columns (unique index)
                    ['is_required', 'sort_order', 'updated_at'] // columns updated on conflict
                );
            }

            $badge = $type->wasRecentlyCreated ? 'created' : 'updated';
            $this->command->info("  ✓ [{$badge}] {$type->name}");
        }

        $this->command->info('AssistanceTypeSeeder complete.');
    }

    // -------------------------------------------------------------------------
    // Program definitions
    // -------------------------------------------------------------------------

    /**
     * Returns the 7 assistance programs aligned with the Gasan AICS Executive Order.
     *
     *   1. Medical Assistance          (sort 10) — 6 months, per_beneficiary
     *   2. Burial Assistance           (sort 20) — 12 months, per_beneficiary (per-deceased, independent)
     *   3. Educational (Elementary)    (sort 30) — 12 months, per_beneficiary
     *   4. Educational (High School)   (sort 40) — 12 months, per_beneficiary
     *   5. Educational (College)       (sort 50) —  6 months, per_beneficiary
     *   6. Food Assistance             (sort 60) —  0 months (as needed), per_beneficiary
     *   7. Cash Assistance             (sort 70) —  6 months, per_household
     *
     * Sort orders are spaced by 10 so Transportation (sort ~5) or other
     * future types can be inserted without renumbering.
     *
     * cooldown_type:
     *   per_request — cooldown_months enforced between each approved request
     *   one_time    — permanently blocked after first approval (capability kept,
     *                 but no program currently uses it; Burial is per_request/12mo)
     *
     * cooldown_scope:
     *   per_beneficiary — cooldown follows the individual across households
     *   per_household   — any member of the same household triggers the block
     *
     * is_independent:
     *   false — participates in the cross-program lockout (default)
     *   true  — evaluated in isolation; only cools down itself (Burial). For an
     *           on-behalf-of-deceased program this means the cooldown is per
     *           deceased person, keyed on the on-behalf household member.
     *
     * Amount fields:
     *   min_amount / max_amount bound what the approver can grant.
     *   Citizens never propose an amount — the Mayor/LCE sets it on approval.
     */
    private function programs(): array
    {
        return [
            // ----------------------------------------------------------------
            // 1. Medical Assistance
            // EO: Hospital bills ₱1,000–₱10,000 once every 6 months.
            //     Out-patient medicines/labs ₱actual–₱10,000 once every 3 months.
            //     Using 6 months here (the more conservative hospital-bill cycle)
            //     so a single type covers both sub-types safely.
            // ----------------------------------------------------------------
            [
                'name' => 'Medical Assistance',
                'slug' => 'medical',
                'description' => 'Financial aid for hospital bills, medicines, laboratory fees, and medical procedures for indigent residents. Covers both in-patient and out-patient expenses.',
                'cooldown_months' => 6,  // EO: hospital bills = once every 6 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'min_amount' => 1000.00,
                'max_amount' => 10000.00,
                'sort_order' => 10,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'medical_supporting_document', 'is_required' => true, 'sort_order' => 30],
                    ['key' => 'med_abstract', 'is_required' => true, 'sort_order' => 40],
                ],
            ],

            // ----------------------------------------------------------------
            // 2. Burial Assistance
            // EO: Funeral Expenses ₱5,000–₱10,000 | Transfer of Cadaver ₱5,000–₱10,000
            //     Casualties ₱10,000/casualty.
            //     NOT one-time: a household can suffer more than one death over time.
            //     Modeled as a 12-month cooldown scoped PER DECEASED PERSON (keyed on
            //     the on-behalf household member), and INDEPENDENT of the cross-program
            //     lockout — a death is an emergency and must not be gated by an
            //     unrelated medical/educational cooldown.
            //     Applied for by an authorized representative — the deceased cannot apply.
            // ----------------------------------------------------------------
            [
                'name' => 'Burial Assistance',
                'slug' => 'burial',
                'description' => 'Financial aid for funeral expenses, transfer of cadaver, and related burial costs of a deceased household member. Applied for by an authorized family representative.',
                'cooldown_months' => 12,   // one approved burial per deceased person every 12 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'is_independent' => true,  // per-deceased; does not cross-block other programs
                'min_amount' => 5000.00,
                'max_amount' => 10000.00,
                'sort_order' => 20,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'death_cert', 'is_required' => true, 'sort_order' => 30],
                    ['key' => 'funeral_contract', 'is_required' => true, 'sort_order' => 40],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 50],
                ],
            ],

            // ----------------------------------------------------------------
            // 3a. Educational Assistance — Elementary
            // EO: ₱500–₱1,000 | Once per school year | Max 3 children per family
            // ----------------------------------------------------------------
            [
                'name' => 'Educational Assistance (Elementary)',
                'slug' => 'educational-elementary',
                'description' => 'Cash grant for indigent elementary school students (Grades 1–6) to defray school fees, supplies, and other related expenses. Maximum of three (3) children per family.',
                'cooldown_months' => 12, // once per school year ≈ 12 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'min_amount' => 500.00,
                'max_amount' => 1000.00,
                'sort_order' => 30,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'cert_enrollment', 'is_required' => true, 'sort_order' => 30],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 40],
                    ['key' => 'report_card', 'is_required' => false, 'sort_order' => 50],
                ],
            ],

            // ----------------------------------------------------------------
            // 3b. Educational Assistance — High School
            // EO: ₱1,000–₱2,000 | Once per school year | Max 3 children per family
            //     Includes SHS (Senior High School) and vocational/tech schools.
            // ----------------------------------------------------------------
            [
                'name' => 'Educational Assistance (High School)',
                'slug' => 'educational-highschool',
                'description' => 'Cash grant for indigent junior and senior high school students, including vocational and technical school enrollees. Maximum of three (3) children per family.',
                'cooldown_months' => 12, // once per school year ≈ 12 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'min_amount' => 1000.00,
                'max_amount' => 2000.00,
                'sort_order' => 40,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'cert_enrollment', 'is_required' => true, 'sort_order' => 30],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 40],
                    ['key' => 'report_card', 'is_required' => false, 'sort_order' => 50],
                ],
            ],

            // ----------------------------------------------------------------
            // 3c. Educational Assistance — College
            // EO: ₱3,000–₱5,000 | Once per semester (varies per region)
            //     Priority: working students in state colleges/universities.
            //     Not applicable for graduate or post-graduate studies.
            // ----------------------------------------------------------------
            [
                'name' => 'Educational Assistance (College)',
                'slug' => 'educational-college',
                'description' => 'Cash grant for indigent college students enrolled in state colleges, universities, or other tertiary institutions. Granted once per semester. Not applicable for graduate or post-graduate studies.',
                'cooldown_months' => 6,  // once per semester ≈ 6 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'min_amount' => 3000.00,
                'max_amount' => 5000.00,
                'sort_order' => 50,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'cert_enrollment', 'is_required' => true, 'sort_order' => 30],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 40],
                    ['key' => 'report_card', 'is_required' => false, 'sort_order' => 50],
                ],
            ],

            // ----------------------------------------------------------------
            // 4. Food Assistance
            // EO: ₱80/meal × up to 10 days | "As needed" — no fixed cooldown
            //     Covers hot meals, food packs, or cash equivalent.
            // ----------------------------------------------------------------
            [
                'name' => 'Food Assistance',
                'slug' => 'food',
                'description' => 'Emergency food pack or cash-for-food assistance for households and individuals facing food insecurity or crisis. Provided as needed with no fixed cooldown period.',
                'cooldown_months' => 0,  // EO: "as needed" — no cooldown restriction
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_beneficiary',
                'min_amount' => 800.00,   // ₱80/meal × 10 days minimum
                'max_amount' => 3000.00,
                'sort_order' => 60,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 30],
                ],
            ],

            // ----------------------------------------------------------------
            // 5. Cash / Financial Assistance
            // EO: ₱2,000–₱5,000 | Once every 6 months | Maximum of one year
            //     Per household (E.O. scope).
            // ----------------------------------------------------------------
            [
                'name' => 'Financial Assistance',
                'slug' => 'financial',
                'description' => 'General cash aid for indigent individuals and families in extremely difficult circumstances such as victims of calamities, disaster, crimes, or other crisis situations not covered by other programs.',
                'cooldown_months' => 6,  // EO: once every 6 months
                'cooldown_type' => 'per_request',
                'cooldown_scope' => 'per_household', // per E.O.: one grant per household per cooldown window
                'min_amount' => 2000.00,
                'max_amount' => 5000.00,
                'sort_order' => 70,
                'documents' => [
                    ['key' => 'valid_id_front', 'is_required' => true, 'sort_order' => 10],
                    ['key' => 'valid_id_back', 'is_required' => true, 'sort_order' => 11],
                    ['key' => 'recipient_valid_id_front', 'is_required' => false, 'sort_order' => 12],
                    ['key' => 'recipient_valid_id_back', 'is_required' => false, 'sort_order' => 13],
                    ['key' => 'indigency_or_need_certificate', 'is_required' => true, 'sort_order' => 20],
                    ['key' => 'brgy_clearance', 'is_required' => false, 'sort_order' => 30],
                ],
            ],
        ];
    }
}
