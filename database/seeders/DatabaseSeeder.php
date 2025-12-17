<?php

namespace Database\Seeders;

use App\Core\Users\Infrastructure\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

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
            AdminSeeder::class,
        ]);
    }
}
