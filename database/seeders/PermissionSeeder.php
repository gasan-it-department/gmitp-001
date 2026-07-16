<?php

namespace Database\Seeders;

use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

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

        $decedentPermissions = [
            EnumPermissions::CEMETERY_DECEDENTS_VIEW->value,
            EnumPermissions::CEMETERY_DECEDENTS_MANAGE->value,
            EnumPermissions::CEMETERY_DECEDENTS_VERIFY->value,
            EnumPermissions::CEMETERY_DECEDENTS_CORRECT->value,
            EnumPermissions::CEMETERY_DECEDENTS_OVERRIDE->value,
            EnumPermissions::CEMETERY_DECEDENTS_DOCUMENTS_VIEW->value,
        ];

        // Preserve access for existing Cemetery admins during the permission split.
        User::permission(EnumPermissions::CEMETERY_ACCESS->value)
            ->each(fn (User $user) => $user->givePermissionTo($decedentPermissions));

    }
}
