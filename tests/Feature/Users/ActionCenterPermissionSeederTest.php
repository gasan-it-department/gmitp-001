<?php

use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\User;
use Database\Seeders\PermissionSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Spatie\Permission\PermissionRegistrar;

beforeEach(function () {
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('middle_name')->nullable();
        $table->string('phone')->nullable();
        $table->string('email')->nullable();
        $table->ulid('municipal_id')->nullable();
        $table->string('password')->nullable();
        $table->timestamp('phone_verified_at')->nullable();
        $table->timestamp('deactivated_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    $this->permissionMigration = require database_path('migrations/2025_12_16_160234_create_permission_tables.php');
    $this->permissionMigration->up();
    app(PermissionRegistrar::class)->forgetCachedPermissions();
});

afterEach(function () {
    app(PermissionRegistrar::class)->forgetCachedPermissions();
    $this->permissionMigration->down();
    Schema::dropIfExists('users');
});

it('grants the action center split once without restoring later revocations', function () {
    Permission::query()->create([
        'name' => EnumPermissions::ACTION_CENTER_ACCESS->value,
        'guard_name' => 'web',
    ]);

    $admin = User::query()->create([
        'id' => (string) Str::ulid(),
        'first_name' => 'Legacy',
        'last_name' => 'Administrator',
    ]);
    $admin->givePermissionTo(EnumPermissions::ACTION_CENTER_ACCESS->value);

    app(PermissionSeeder::class)->run();
    $admin->refresh();

    $splitPermissions = [
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

    foreach ($splitPermissions as $permission) {
        expect($admin->hasPermissionTo($permission))->toBeTrue();
    }

    $revokedPermission = EnumPermissions::ACTION_CENTER_REQUESTS_RELEASE->value;
    $admin->revokePermissionTo($revokedPermission);

    app(PermissionSeeder::class)->run();
    $admin->refresh();

    expect($admin->hasPermissionTo($revokedPermission))->toBeFalse();
});
