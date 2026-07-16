<?php

namespace App\Console\Commands;

use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Illuminate\Console\Command;

class BackfillUserRoles extends Command
{
    protected $signature = 'users:backfill-roles';
    protected $description = 'Assign the default client role to role-less users and enforce that clients have no municipal_id.';

    public function handle(): int
    {
        $this->info('Backfilling roles for role-less users...');

        $fixed = 0;

        // Role-less users are clients — admins/super_admins were assigned roles
        // explicitly via seeders / CreateAdminUseCase, so they already have one.
        User::doesntHave('roles')
            ->chunkById(200, function ($users) use (&$fixed) {
                foreach ($users as $user) {
                    $user->assignRole(EnumRoles::CLIENT->value);
                    $fixed++;
                }
            });

        $this->info("Assigned the '" . EnumRoles::CLIENT->value . "' role to {$fixed} user(s).");

        // Enforce the rule: clients are municipality-less. municipal_id is an
        // admin-only concept (the citizen's municipality comes from the URL).
        $cleared = 0;

        User::role(EnumRoles::CLIENT->value)
            ->whereNotNull('municipal_id')
            ->whereDoesntHave('roles', fn($q) => $q->whereIn('name', [
                EnumRoles::ADMIN->value,
                EnumRoles::SUPER_ADMIN->value,
            ]))
            ->chunkById(200, function ($users) use (&$cleared) {
                foreach ($users as $user) {
                    $user->municipal_id = null;
                    $user->save();
                    $cleared++;
                }
            });

        $this->info("Cleared municipal_id on {$cleared} client account(s).");

        return self::SUCCESS;
    }
}
