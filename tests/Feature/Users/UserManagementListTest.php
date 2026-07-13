<?php

use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\Role;
use App\Core\Users\Models\User;
use App\External\Web\Controllers\UserManagement\SuperAdmin\ListUserManagementController;
use App\Http\Middleware\SuperAdmin\SuperAdminGuardMiddleware;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Schema::create('municipalities', function ($table) {
        $table->ulid('id')->primary();
        $table->string('psgc_municipal_id')->nullable();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(false);
        $table->string('zip_code')->unique()->nullable();
        $table->softDeletes();
        $table->timestamps();
    });

    Schema::create('users', function ($table) {
        $table->ulid('id')->primary();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->ulid('municipal_id')->nullable();
        $table->string('last_name');
        $table->string('phone')->nullable()->unique();
        $table->string('email')->nullable()->unique();
        $table->timestamp('deactivated_at')->nullable();
        $table->timestamp('phone_verified_at')->nullable();
        $table->timestamp('email_verified_at')->nullable();
        $table->string('password')->nullable();
        $table->rememberToken();
        $table->timestamps();
    });

    Schema::create('roles', function ($table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
        $table->unique(['name', 'guard_name']);
    });

    Schema::create('permissions', function ($table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
        $table->unique(['name', 'guard_name']);
    });

    Schema::create('model_has_roles', function ($table) {
        $table->ulid('role_id');
        $table->string('model_type');
        $table->ulid('model_id');
        $table->primary(['role_id', 'model_id', 'model_type']);
    });

    Schema::create('model_has_permissions', function ($table) {
        $table->ulid('permission_id');
        $table->string('model_type');
        $table->ulid('model_id');
        $table->primary(['permission_id', 'model_id', 'model_type']);
    });

    Schema::create('role_has_permissions', function ($table) {
        $table->ulid('permission_id');
        $table->ulid('role_id');
        $table->primary(['permission_id', 'role_id']);
    });

    Schema::create('media', function ($table) {
        $table->id();
        $table->string('model_type');
        $table->string('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
    });

    foreach (EnumRoles::cases() as $role) {
        Role::query()->create([
            'id' => (string) Str::ulid(),
            'name' => $role->value,
            'guard_name' => 'web',
        ]);
    }

    $this->withoutMiddleware(SuperAdminGuardMiddleware::class);
});

afterEach(function () {
    Schema::dropIfExists('media');
    Schema::dropIfExists('role_has_permissions');
    Schema::dropIfExists('model_has_permissions');
    Schema::dropIfExists('model_has_roles');
    Schema::dropIfExists('permissions');
    Schema::dropIfExists('roles');
    Schema::dropIfExists('users');
    Schema::dropIfExists('municipalities');
});

function usersTestMunicipality(string $name, string $suffix): Municipality
{
    return Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => $name,
        'slug' => Str::slug($name) . '-' . $suffix,
        'municipal_code' => 'MUN-' . $suffix,
        'psgc_municipal_id' => 'PSGC-' . $suffix,
        'zip_code' => '49' . str_pad($suffix, 2, '0', STR_PAD_LEFT),
        'is_active' => true,
    ]);
}

function usersTestUser(array $attributes = []): User
{
    return User::query()->create(array_merge([
        'id' => (string) Str::ulid(),
        'first_name' => 'Test',
        'last_name' => 'User',
        'phone' => '639' . random_int(100000000, 999999999),
        'email' => Str::lower((string) Str::ulid()) . '@example.test',
        'password' => 'hashed-password',
    ], $attributes));
}

it('uses the invokable controller for the user-management route', function () {
    $route = Route::getRoutes()->getByName('superAdmin.users.page');

    expect($route->getAction('controller'))
        ->toContain(ListUserManagementController::class);
});

it('searches users by first name, last name, email, and phone', function (string $search) {
    $user = usersTestUser([
        'first_name' => 'SearchableFirst',
        'last_name' => 'SearchableLast',
        'email' => 'searchable@example.test',
        'phone' => '639171234567',
    ]);
    $user->assignRole(EnumRoles::CLIENT->value);

    $this->get(route('superAdmin.users.page', [
            'filter' => ['search' => $search],
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('UserManagement/SuperAdmin/List/UserManagement')
            ->where('filters.filter.search', $search)
            ->has('users.data', 1)
            ->where('users.data.0.id', $user->id)
        );
})->with([
    'first name' => ['SearchableFirst'],
    'last name' => ['SearchableLast'],
    'email' => ['searchable@example.test'],
    'phone' => ['639171234567'],
]);

it('combines search, role, municipality, and pagination filters', function () {
    $gasan = usersTestMunicipality('Gasan', '01');
    $boac = usersTestMunicipality('Boac', '02');

    foreach (range(1, 21) as $index) {
        $admin = usersTestUser([
            'first_name' => 'Filtered',
            'last_name' => "Admin {$index}",
            'municipal_id' => $gasan->id,
        ]);
        $admin->assignRole(EnumRoles::ADMIN->value);
    }

    $client = usersTestUser([
        'first_name' => 'Filtered',
        'municipal_id' => $gasan->id,
    ]);
    $client->assignRole(EnumRoles::CLIENT->value);

    $otherMunicipalityAdmin = usersTestUser([
        'first_name' => 'Filtered',
        'municipal_id' => $boac->id,
    ]);
    $otherMunicipalityAdmin->assignRole(EnumRoles::ADMIN->value);

    $this->get(route('superAdmin.users.page', [
            'filter' => [
                'search' => 'Filtered',
                'role' => EnumRoles::ADMIN->value,
                'municipality' => $gasan->name,
            ],
            'page' => 2,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.filter.search', 'Filtered')
            ->where('filters.filter.role', EnumRoles::ADMIN->value)
            ->where('filters.filter.municipality', $gasan->name)
            ->where('users.meta.current_page', 2)
            ->has('users.data', 1)
        );
});
