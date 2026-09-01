<?php

use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('services.supabase.url', 'https://aga-auth.supabase.co');
    config()->set('services.supabase.anon_key', 'aga-test-anon-key');

    $this->seed(RoleSeeder::class);
    $this->withoutMiddleware(ThrottleRequests::class);
    Http::preventStrayRequests();
});

function fakeAgaSupabaseAuthUser(array $overrides = []): array
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

function createAgaLaravelUser(EnumRoles $role = EnumRoles::CLIENT, array $attributes = []): User
{
    $user = User::factory()->create(array_merge([
        'municipal_id' => null,
    ], $attributes));

    $user->assignRole($role->value);

    return $user;
}

function linkAgaSupabaseIdentity(User $user, string $providerId): UserSocialAccount
{
    return UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $providerId,
        'avatar_url' => null,
    ]);
}

it('creates a Laravel citizen from a verified phone-only Supabase user', function (string $phone) {
    $supabaseUser = fakeAgaSupabaseAuthUser(['phone' => $phone]);

    $response = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'verified-phone-session',
        'device_name' => 'AGA iOS App',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.user.first_name', 'Juan')
        ->assertJsonPath('data.user.last_name', 'Dela Cruz')
        ->assertJsonPath('data.user.email', null)
        ->assertJsonPath('data.user.phone', '639171234567');

    $userId = $response->json('data.user.id');

    $this->assertDatabaseHas('users', [
        'id' => $userId,
        'phone' => '639171234567',
        'email' => null,
        'password' => null,
        'municipal_id' => null,
    ]);
    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $userId,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
    ]);
    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $userId,
        'name' => 'AGA iOS App',
    ]);

    $user = User::query()->findOrFail($userId);

    expect($user->phone_verified_at)->not->toBeNull()
        ->and($user->hasRole(EnumRoles::CLIENT->value))->toBeTrue();

    Http::assertSent(fn (Request $request) => $request->url() === 'https://aga-auth.supabase.co/auth/v1/user'
        && $request->hasHeader('Authorization', 'Bearer verified-phone-session')
        && $request->hasHeader('apikey', 'aga-test-anon-key'));
})->with([
    'E.164 phone' => ['+639171234567'],
    'canonical phone' => ['639171234567'],
    'local phone' => ['09171234567'],
]);

it('links an existing Laravel citizen by verified phone without creating a duplicate', function () {
    $user = createAgaLaravelUser(attributes: [
        'email' => null,
        'phone' => '639171234567',
        'phone_verified_at' => now()->subDay(),
    ]);
    $supabaseUser = fakeAgaSupabaseAuthUser([
        'user_metadata' => [],
    ]);

    $response = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'existing-citizen-session',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.phone', '639171234567');

    expect(User::query()->count())->toBe(1)
        ->and(UserSocialAccount::query()->count())->toBe(1);

    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
    ]);
});

it('reuses the exact Supabase identity on repeated exchanges', function () {
    $supabaseUser = fakeAgaSupabaseAuthUser();

    $first = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'repeatable-session',
    ])->assertOk();

    $second = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'repeatable-session',
    ])->assertOk();

    expect($second->json('data.user.id'))->toBe($first->json('data.user.id'))
        ->and(User::query()->count())->toBe(1)
        ->and(UserSocialAccount::query()
            ->where('provider_name', 'supabase')
            ->where('provider_id', $supabaseUser['id'])
            ->count())->toBe(1);
});

it('keeps existing email-based Supabase login working', function () {
    $supabaseUser = fakeAgaSupabaseAuthUser([
        'email' => 'Citizen@Example.test',
        'phone' => null,
        'phone_confirmed_at' => null,
    ]);

    $response = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'email-session',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('data.user.email', 'citizen@example.test')
        ->assertJsonPath('data.user.phone', null);

    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $response->json('data.user.id'),
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUser['id'],
    ]);
});

it('rejects a phone-only Supabase identity whose phone is not confirmed', function () {
    fakeAgaSupabaseAuthUser([
        'phone_confirmed_at' => null,
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'unconfirmed-phone-session',
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_INVALID');

    expect(User::query()->count())->toBe(0);
});

it('rejects a malformed Philippine phone from Supabase', function () {
    fakeAgaSupabaseAuthUser([
        'phone' => '+6312345',
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'malformed-phone-session',
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_INVALID');

    expect(User::query()->count())->toBe(0);
});

it('requires names before creating a new phone-only Laravel citizen', function () {
    fakeAgaSupabaseAuthUser([
        'user_metadata' => [],
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'missing-profile-session',
    ])
        ->assertStatus(422)
        ->assertJsonPath('code', 'AUTH_SUPABASE_PROFILE_INCOMPLETE');

    expect(User::query()->count())->toBe(0);
});

it('does not automatically link an administrative Laravel account by phone', function () {
    createAgaLaravelUser(EnumRoles::ADMIN, [
        'phone' => '639171234567',
    ]);
    fakeAgaSupabaseAuthUser();

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'admin-phone-session',
    ])
        ->assertStatus(409)
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_CONFLICT');

    expect(UserSocialAccount::query()->count())->toBe(0)
        ->and(DB::table('personal_access_tokens')->count())->toBe(0);
});

it('rejects a Supabase identity whose phone and email resolve to different citizens', function () {
    createAgaLaravelUser(attributes: [
        'email' => null,
        'phone' => '639171234567',
    ]);
    createAgaLaravelUser(attributes: [
        'email' => 'citizen@example.test',
        'phone' => null,
    ]);
    fakeAgaSupabaseAuthUser([
        'email' => 'citizen@example.test',
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'split-identity-session',
    ])
        ->assertStatus(409)
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_CONFLICT');

    expect(UserSocialAccount::query()->count())->toBe(0);
});

it('does not replace a citizen existing Supabase UUID', function () {
    $user = createAgaLaravelUser(attributes: [
        'email' => null,
        'phone' => '639171234567',
    ]);
    $oldProviderId = (string) Str::uuid();
    linkAgaSupabaseIdentity($user, $oldProviderId);
    fakeAgaSupabaseAuthUser();

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'different-provider-session',
    ])
        ->assertStatus(409)
        ->assertJsonPath('code', 'AUTH_SUPABASE_IDENTITY_CONFLICT');

    $this->assertDatabaseHas('user_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $oldProviderId,
    ]);
});

it('updates the verified phone for an exactly linked Supabase citizen', function () {
    $user = createAgaLaravelUser(attributes: [
        'email' => null,
        'phone' => '639181111111',
        'phone_verified_at' => now()->subYear(),
    ]);
    $providerId = (string) Str::uuid();
    linkAgaSupabaseIdentity($user, $providerId);
    fakeAgaSupabaseAuthUser([
        'id' => $providerId,
        'phone' => '+639171234567',
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'changed-phone-session',
    ])
        ->assertOk()
        ->assertJsonPath('data.user.id', $user->id)
        ->assertJsonPath('data.user.phone', '639171234567');

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'phone' => '639171234567',
    ]);
});

it('does not issue a Sanctum token to a deactivated linked citizen', function () {
    $user = createAgaLaravelUser(attributes: [
        'email' => null,
        'phone' => '639171234567',
        'deactivated_at' => now(),
    ]);
    $providerId = (string) Str::uuid();
    linkAgaSupabaseIdentity($user, $providerId);
    fakeAgaSupabaseAuthUser([
        'id' => $providerId,
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'deactivated-session',
    ])
        ->assertStatus(402)
        ->assertJsonPath('code', 'AUTH_ACCOUNT_DEACTIVATED');

    expect(DB::table('personal_access_tokens')->count())->toBe(0);
});
