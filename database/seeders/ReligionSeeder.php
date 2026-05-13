<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ReligionSeeder extends Seeder
{
    /**
     * Seed the ac_religions lookup table.
     *
     * This is a global (non-municipality-scoped) dropdown used on the
     * beneficiary profile form. MSWD staff can add custom entries via
     * the admin panel without needing a developer migration.
     *
     * Idempotent — insertOrIgnore skips rows where name already exists.
     */
    public function run(): void
    {
        $religions = [
            ['name' => 'Roman Catholic',                                    'sort_order' => 10],
            ['name' => 'Iglesia ni Cristo',                                 'sort_order' => 20],
            ['name' => 'Islam',                                             'sort_order' => 30],
            ['name' => 'Aglipayan (Philippine Independent Church)',         'sort_order' => 40],
            ['name' => 'Born Again Christian',                              'sort_order' => 50],
            ['name' => 'Seventh-day Adventist',                             'sort_order' => 60],
            ['name' => 'Baptist',                                           'sort_order' => 70],
            ['name' => 'United Church of Christ in the Philippines (UCCP)', 'sort_order' => 80],
            ['name' => 'Jehovah\'s Witnesses',                              'sort_order' => 90],
            ['name' => 'The Church of Jesus Christ of Latter-day Saints',   'sort_order' => 100],
            ['name' => 'Other Christian Denomination',                      'sort_order' => 110],
            ['name' => 'Other Religion',                                    'sort_order' => 120],
            ['name' => 'Prefer Not to Say',                                 'sort_order' => 130],
            ['name' => 'No Religion / Agnostic',                           'sort_order' => 140],
        ];

        $now  = now();
        $rows = array_map(fn (array $r) => [
            'id'         => (string) Str::ulid(),
            'name'       => $r['name'],
            'is_active'  => true,
            'sort_order' => $r['sort_order'],
            'created_at' => $now,
            'updated_at' => $now,
        ], $religions);

        // insertOrIgnore: skip rows whose `name` already exists (unique index).
        DB::table('ac_religions')->insertOrIgnore($rows);

        $this->command->info('ReligionSeeder: ' . count($rows) . ' entries seeded.');
    }
}
