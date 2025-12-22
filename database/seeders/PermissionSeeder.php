<?php

namespace Database\Seeders;

use App\Core\Users\Enums\EnumPermissions;
use Illuminate\Database\Seeder;
use App\Core\Users\Models\Permission;
use Spatie\Permission\PermissionRegistrar;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (EnumPermissions::cases() as $permission) {

            Permission::firstOrCreate(['name' => $permission->value]);

        }


    }
}
