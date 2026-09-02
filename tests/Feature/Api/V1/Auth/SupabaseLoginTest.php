<?php

use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    config()->set('services.supabase.url', 'https://supabase.example.test');
    config()->set('services.supabase.anon_key', 'test-anon-key');
});

it('issues a Sanctum token to a verified phone-only Supabase user', function () {
    Http::fake([
        'https://supabase.example.test/auth/v1/user' => Http::response([
            'id' => 'new-supabase-phone-id',
            'email' => null,
            'phone' => '+639171234567',
            'phone_confirmed_at' => '2026-09-02T00:00:00Z',
            'user_metadata' => [
                'full_name' => 'Mobile Citizen',
            ],
        ]),
    ]);

    $response = $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'verified-supabase-token',
        'device_name' => 'AGA Android App',
    ]);

    $response->assertOk()
        ->assertJsonPath('data.token_type', 'Bearer')
        ->assertJsonPath('data.user.full_name', 'Mobile Citizen')
        ->assertJsonPath('data.user.phone', '639171234567');

    expect($response->json('data.token'))->toBeString()->not->toBeEmpty();
    $this->assertDatabaseHas('users', [
        'email' => null,
        'phone' => '639171234567',
        'first_name' => 'Mobile',
        'last_name' => 'Citizen',
    ]);
    $this->assertDatabaseHas('user_social_accounts', [
        'provider_name' => 'supabase',
        'provider_id' => 'new-supabase-phone-id',
    ]);
});

it('relinks a recreated Supabase identity before issuing a token', function () {
    $user = User::factory()->create([
        'email' => null,
        'phone' => '639171234567',
    ]);
    $socialAccount = UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'deleted-supabase-id',
    ]);

    Http::fake([
        'https://supabase.example.test/auth/v1/user' => Http::response([
            'id' => 'recreated-supabase-id',
            'email' => null,
            'phone' => '+639171234567',
            'phone_confirmed_at' => '2026-09-02T00:00:00Z',
            'user_metadata' => ['full_name' => 'Mobile Citizen'],
        ]),
    ]);

    $this->postJson('/api/v1/auth/supabase', [
        'access_token' => 'verified-supabase-token',
        'device_name' => 'AGA iOS App',
    ])->assertOk();

    $this->assertDatabaseHas('user_social_accounts', [
        'id' => $socialAccount->id,
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'recreated-supabase-id',
    ]);
    $this->assertDatabaseMissing('user_social_accounts', [
        'provider_name' => 'supabase',
        'provider_id' => 'deleted-supabase-id',
    ]);
});
