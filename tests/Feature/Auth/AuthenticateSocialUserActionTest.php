<?php

use App\Core\Auth\Actions\AuthenticateSocialUserAction;
use App\Core\Auth\Dto\SocialUserDto;
use App\Core\Auth\Models\UserSocialAccount;
use App\Core\Users\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

it('updates an existing provider link instead of creating a duplicate', function () {
    $user = User::factory()->create([
        'email' => 'citizen@example.test',
    ]);

    $socialAccount = UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'old-supabase-user-id',
        'avatar_url' => 'https://example.test/old-avatar.jpg',
    ]);

    $dto = new SocialUserDto(
        providerName: 'supabase',
        providerId: 'current-supabase-user-id',
        email: 'citizen@example.test',
        firstName: 'Citizen',
        lastName: 'User',
        avatarUrl: 'https://example.test/current-avatar.jpg',
    );

    $action = app(AuthenticateSocialUserAction::class);

    $authenticatedUser = $action->execute($dto);
    $repeatedUser = $action->execute($dto);

    expect($authenticatedUser->is($user))->toBeTrue()
        ->and($repeatedUser->is($user))->toBeTrue()
        ->and(UserSocialAccount::query()
            ->where('user_id', $user->id)
            ->where('provider_name', 'supabase')
            ->count())->toBe(1);

    $this->assertDatabaseHas('user_social_accounts', [
        'id' => $socialAccount->id,
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'current-supabase-user-id',
        'avatar_url' => 'https://example.test/current-avatar.jpg',
    ]);

    $this->assertDatabaseMissing('user_social_accounts', [
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'old-supabase-user-id',
    ]);
});

it('relinks a recreated phone-only Supabase identity', function () {
    $user = User::factory()->create([
        'email' => null,
        'phone' => '639171234567',
    ]);

    $socialAccount = UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'deleted-supabase-user-id',
    ]);

    $dto = new SocialUserDto(
        providerName: 'supabase',
        providerId: 'recreated-supabase-user-id',
        email: null,
        firstName: 'Mobile',
        lastName: 'Citizen',
        phone: '639171234567',
    );

    $authenticatedUser = app(AuthenticateSocialUserAction::class)->execute($dto);

    expect($authenticatedUser->is($user))->toBeTrue();
    $this->assertDatabaseHas('user_social_accounts', [
        'id' => $socialAccount->id,
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => 'recreated-supabase-user-id',
    ]);
});
