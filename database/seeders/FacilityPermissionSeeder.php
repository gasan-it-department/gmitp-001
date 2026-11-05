<?php

namespace Database\Seeders;

use App\Core\Users\Enums\EnumPermissionModule;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\Permission;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class FacilityPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Catalogue this module only; preserve existing role and user grants.
        foreach (EnumPermissions::cases() as $permission) {
            if ($permission->module() === EnumPermissionModule::FACILITY) {
                Permission::firstOrCreate(['name' => $permission->value, 'guard_name' => 'web']);
            }
        }
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
