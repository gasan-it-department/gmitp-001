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
            // AdminSeeder::class,
        ]);

        $this->call([
            ActionCenterSeeder::class,
        ]);
    }
}
