<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Database\Seeders\ActionCenterSeeder;
use App\Core\Users\Infrastructure\Models\User;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            PermissionSeeder::class,
            MunicipalitySeeder::class,
            SuperAdminSeeder::class,
            PositionSeeder::class,
            AdminSeeder::class,
            DepartmentSeeder::class,
                // EventsSeeder::class,
                // AnnouncementSeeder::class,
            ProcurementFundingSourceSeeder::class,
        ]);

        // ── Action Center lookup tables ───────────────────────────────────────
        // Run these once after the core seeders above.
        // Order matters: DocumentTypes → AssistanceTypes (pivot depends on both).
        //
        $this->call([
            ReligionSeeder::class,
            AssistanceDocumentTypeSeeder::class,
            AssistanceTypeSeeder::class,
        ]);

        // ── Fake / dev data (never run on production) ─────────────────────────
        // $this->call([
        //     ActionCenterSeeder::class,
        // ]);
    }
}
