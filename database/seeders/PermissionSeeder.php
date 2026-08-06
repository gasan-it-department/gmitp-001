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

        $actionCenterPermissions = [
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_VIEW->value,
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_MANAGE->value,
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_VERIFY->value,
            EnumPermissions::ACTION_CENTER_BENEFICIARIES_CORRECT->value,
            EnumPermissions::ACTION_CENTER_REQUESTS_VIEW->value,
            EnumPermissions::ACTION_CENTER_REQUESTS_PROCESS->value,
            EnumPermissions::ACTION_CENTER_REQUESTS_DECIDE->value,
            EnumPermissions::ACTION_CENTER_REQUESTS_RELEASE->value,
            EnumPermissions::ACTION_CENTER_REPORTS_VIEW->value,
            EnumPermissions::ACTION_CENTER_SETTINGS_MANAGE->value,
        ];

        $actionCenterSplitAlreadyExists = Permission::query()
            ->whereIn('name', $actionCenterPermissions)
            ->count() === count($actionCenterPermissions);

        foreach (EnumPermissions::cases() as $permission) {
            Permission::firstOrCreate(['name' => $permission->value]);
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Preserve the effective access existing Action Center admins had at
        // the moment the complete capability split is first deployed. Later
        // seeder runs see the catalog already present, so they do not restore
        // permissions that were deliberately revoked.
        if (! $actionCenterSplitAlreadyExists) {
            User::permission(EnumPermissions::ACTION_CENTER_ACCESS->value)
                ->each(fn (User $user) => $user->givePermissionTo($actionCenterPermissions));
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
