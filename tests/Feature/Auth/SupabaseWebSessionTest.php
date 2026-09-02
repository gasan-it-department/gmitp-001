<?php

use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use App\Http\Middleware\Municipality\SetMunicipalityContext;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('services.supabase.url', 'https://aga-auth.supabase.co');
    config()->set('services.supabase.anon_key', 'aga-test-anon-key');

    $this->seed(RoleSeeder::class);
    $this->withoutMiddleware([
        SetMunicipalityContext::class,
        ThrottleRequests::class,
    ]);

    app()->instance('current_municipality', (object) ['slug' => 'gasan-4905']);
    Http::preventStrayRequests();
});

function fakeSupabaseWebAuthUser(array $overrides = []): array
{
    $user = array_replace([
        'id' => (string) Str::uuid(),
        'email' => null,
        'phone' => '+639171234567',
        'phone_confirmed_at' => now()->toIso8601String(),
        'user_metadata' => [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
        ],
    ], $overrides);

    Http::fake([
        'https://aga-auth.supabase.co/auth/v1/user' => Http::response($user),
    ]);

    return $user;
}

function createSupabaseWebCitizen(array $attributes = []): User
{
    $user = User::factory()->create(array_merge([
        'municipal_id' => null,
    ], $attributes));

    $user->assignRole(EnumRoles::CLIENT->value);

    return $user;
}

it('creates a Laravel cookie session for a verified AGA phone user', function () {
    $supabaseUser = fakeSupabaseWebAuthUser();

    $response = $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'verified-web-session',
        'remember_me' => false,
    ], [
        'X-Municipality-Slug' => 'gasan-4905',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.redirect_url', route('home', ['municipality' => 'gasan-4905']))
        ->assertJsonPath('data.user.first_name', 'Juan')
        ->assertJsonPath('data.user.last_name', 'Dela Cruz')
        ->assertJsonPath('data.user.phone', '639171234567');

    $userId = $response->json('data.user.id');

    $this->assertAuthenticatedAs(User::query()->findOrFail($userId));
    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $userId,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
    ]);
    expect(DB::table('personal_access_tokens')->count())->toBe(0);
});

it('links an existing citizen by verified phone without creating a duplicate', function () {
    $user = createSupabaseWebCitizen([
        'email' => null,
        'phone' => '639171234567',
        'phone_verified_at' => now()->subDay(),
    ]);
    $supabaseUser = fakeSupabaseWebAuthUser();

    $response = $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'existing-citizen-session',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id);

    expect(User::query()->count())->toBe(1)
        ->and(UserSocialAccount::query()->count())->toBe(1);

    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
    ]);
});

it('reuses an existing Supabase mapping after the citizen signs out', function () {
    $user = createSupabaseWebCitizen([
        'email' => null,
        'phone' => '639171234567',
    ]);
    $supabaseUser = fakeSupabaseWebAuthUser();

    UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
        'avatar_url' => null,
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'first-web-session',
    ])->assertOk();

    auth()->logout();
    session()->invalidate();

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'second-web-session',
    ])
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id);

    expect(User::query()->count())->toBe(1)
        ->and(UserSocialAccount::query()->count())->toBe(1);
});

it('rejects an invalid Supabase access token without authenticating', function () {
    Http::fake([
        'https://aga-auth.supabase.co/auth/v1/user' => Http::response([
            'message' => 'Invalid JWT',
        ], 401),
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'invalid-session',
    ])
        ->assertUnauthorized()
        ->assertJsonPath('message', 'Invalid Supabase access token.');

    $this->assertGuest();
});

it('rejects an unconfirmed phone-only Supabase identity without authenticating', function () {
    fakeSupabaseWebAuthUser([
        'phone_confirmed_at' => null,
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'unconfirmed-phone-session',
    ])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_INVALID');

    $this->assertGuest();
    expect(User::query()->count())->toBe(0);
});

it('rejects a malformed Supabase phone without authenticating', function () {
    fakeSupabaseWebAuthUser([
        'phone' => '+12125550123',
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'malformed-phone-session',
    ])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_INVALID');

    $this->assertGuest();
    expect(User::query()->count())->toBe(0);
});

it('rejects a Supabase identity whose verified phone and email belong to different citizens', function () {
    createSupabaseWebCitizen([
        'email' => null,
        'phone' => '639171234567',
    ]);
    createSupabaseWebCitizen([
        'email' => 'citizen@example.test',
        'phone' => '639181234567',
    ]);
    fakeSupabaseWebAuthUser([
        'email' => 'citizen@example.test',
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'split-identity-session',
    ])
        ->assertConflict()
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_CONFLICT');

    $this->assertGuest();
    expect(UserSocialAccount::query()->count())->toBe(0);
});

it('does not create a web session for an administrative phone match', function () {
    $admin = User::factory()->create([
        'municipal_id' => null,
        'phone' => '639171234567',
    ]);
    $admin->assignRole(EnumRoles::ADMIN->value);
    fakeSupabaseWebAuthUser();

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'admin-phone-session',
    ])
        ->assertConflict()
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_CONFLICT');

    $this->assertGuest();
    expect(UserSocialAccount::query()->count())->toBe(0);
});

it('does not create a web session for a deactivated citizen', function () {
    $user = createSupabaseWebCitizen([
        'email' => null,
        'phone' => '639171234567',
        'deactivated_at' => now(),
    ]);
    $supabaseUser = fakeSupabaseWebAuthUser();

    UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
        'avatar_url' => null,
    ]);

    $this->postJson('/api/auth/supabase/session', [
        'access_token' => 'deactivated-web-session',
    ])
        ->assertStatus(402)
        ->assertJsonPath('code', 'AUTH_ACCOUNT_DEACTIVATED');

    $this->assertGuest();
});
