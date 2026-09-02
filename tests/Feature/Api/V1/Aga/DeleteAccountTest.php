<?php

use App\Core\Auth\Models\UserSocialAccount;
use App\Core\CommunityReport\Models\ReportSubmission;
use App\Core\Feedback\Models\FeedbackSubmission;
use App\Core\Municipality\Models\Municipality;
use App\Core\SupportTicket\Models\SupportTicket;
use App\Core\SupportTicket\Models\SupportTicketReply;
use App\Core\Users\Enums\EnumRoles;
use App\Core\Users\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

uses(RefreshDatabase::class);

beforeEach(function () {
    config()->set('services.supabase.edge_secret', 'aga-test-secret');
    $this->seed(RoleSeeder::class);
});

function agaDeletionMunicipality(): Municipality
{
    $suffix = Str::lower(Str::random(8));

    return Municipality::query()->create([
        'id' => (string) Str::ulid(),
        'name' => 'AGA Test Municipality',
        'slug' => "aga-test-{$suffix}",
        'municipal_code' => "AGA-{$suffix}",
        'zip_code' => (string) random_int(1000, 9999),
        'is_active' => true,
    ]);
}

function agaDeletionUser(EnumRoles $role, ?string $municipalId = null): User
{
    $user = User::factory()->create([
        'municipal_id' => $municipalId,
    ]);

    $user->assignRole($role->value);

    return $user;
}

function agaDeletionSocialAccount(User $user, string $supabaseUserId): UserSocialAccount
{
    return UserSocialAccount::query()->create([
        'id' => (string) Str::ulid(),
        'user_id' => $user->id,
        'provider_name' => 'supabase',
        'provider_id' => $supabaseUserId,
        'avatar_url' => 'https://example.test/avatar.jpg',
    ]);
}

function agaDeletionMedia(Model $model, string $collection): int
{
    return DB::table('media')->insertGetId([
        'model_type' => $model->getMorphClass(),
        'model_id' => $model->getKey(),
        'uuid' => (string) Str::uuid(),
        'collection_name' => $collection,
        'name' => 'retained-evidence',
        'file_name' => 'retained-evidence.jpg',
        'mime_type' => 'image/jpeg',
        'disk' => 'public',
        'conversions_disk' => null,
        'size' => 128,
        'manipulations' => '[]',
        'custom_properties' => '[]',
        'generated_conversions' => '[]',
        'responsive_images' => '[]',
        'order_column' => 1,
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

it('requires the configured AGA edge secret', function () {
    $user = agaDeletionUser(EnumRoles::CLIENT);
    $supabaseUserId = (string) Str::uuid();
    agaDeletionSocialAccount($user, $supabaseUserId);

    $this->deleteJson('/api/v1/integrations/aga/account', [
        'supabase_user_id' => $supabaseUserId,
    ])->assertUnauthorized();

    $this->withHeader('x-laravel-secret', 'wrong-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertUnauthorized();

    $this->assertDatabaseHas('users', ['id' => $user->id]);
});

it('accepts a verified Supabase bearer token only for the same user ID', function () {
    config()->set('services.supabase.edge_secret', null);
    config()->set('services.supabase.url', 'https://supabase.example.test');
    config()->set('services.supabase.anon_key', 'test-anon-key');

    $user = agaDeletionUser(EnumRoles::CLIENT);
    $supabaseUserId = (string) Str::uuid();
    agaDeletionSocialAccount($user, $supabaseUserId);

    Http::fake([
        'https://supabase.example.test/auth/v1/user' => Http::response([
            'id' => $supabaseUserId,
        ]),
    ]);

    $this->withToken('fresh-supabase-access-token')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertOk();

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
});

it('rejects a Supabase bearer token for a different user ID', function () {
    config()->set('services.supabase.edge_secret', null);
    config()->set('services.supabase.url', 'https://supabase.example.test');
    config()->set('services.supabase.anon_key', 'test-anon-key');

    $user = agaDeletionUser(EnumRoles::CLIENT);
    $linkedSupabaseUserId = (string) Str::uuid();
    agaDeletionSocialAccount($user, $linkedSupabaseUserId);

    Http::fake([
        'https://supabase.example.test/auth/v1/user' => Http::response([
            'id' => (string) Str::uuid(),
        ]),
    ]);

    $this->withToken('another-users-access-token')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $linkedSupabaseUserId,
        ])
        ->assertUnauthorized();

    $this->assertDatabaseHas('users', ['id' => $user->id]);
});

it('rejects an invalid Supabase user ID', function () {
    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => 'not-a-uuid',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('supabase_user_id');
});

it('requires JSON request and response media types', function () {
    $supabaseUserId = (string) Str::uuid();

    $this->call(
        'DELETE',
        '/api/v1/integrations/aga/account',
        [],
        [],
        [],
        [
            'HTTP_X_LARAVEL_SECRET' => 'aga-test-secret',
            'HTTP_ACCEPT' => 'text/html',
            'CONTENT_TYPE' => 'application/json',
        ],
        json_encode(['supabase_user_id' => $supabaseUserId]),
    )->assertStatus(406);

    $this->call(
        'DELETE',
        '/api/v1/integrations/aga/account',
        [],
        [],
        [],
        [
            'HTTP_X_LARAVEL_SECRET' => 'aga-test-secret',
            'HTTP_ACCEPT' => 'application/json',
            'CONTENT_TYPE' => 'text/plain',
        ],
        json_encode(['supabase_user_id' => $supabaseUserId]),
    )->assertStatus(415);
});

it('hard deletes a citizen while retaining anonymized municipal records and media', function () {
    $municipality = agaDeletionMunicipality();
    $user = agaDeletionUser(EnumRoles::CLIENT);
    $supabaseUserId = (string) Str::uuid();
    $socialAccount = agaDeletionSocialAccount($user, $supabaseUserId);
    $createdToken = $user->createToken('AGA iOS App');
    $token = $createdToken->accessToken;

    $report = ReportSubmission::query()->create([
        'municipal_id' => $municipality->id,
        'user_id' => $user->id,
        'category' => 'pothole',
        'status' => 'pending',
        'location_text' => 'Test street',
        'description' => 'Municipal evidence that must remain.',
        'is_anonymous' => false,
    ]);
    $reportMediaId = agaDeletionMedia($report, 'report_submission_evidence');

    $ticket = SupportTicket::query()->create([
        'municipal_id' => $municipality->id,
        'user_id' => $user->id,
        'reference_no' => 'AGA-DELETE-001',
        'audience' => 'citizen',
        'category' => 'help',
        'priority' => 'normal',
        'status' => 'open',
        'subject' => 'Retained support history',
        'description' => 'The support record remains.',
        'contact_name' => 'Citizen Name',
        'contact_email' => 'citizen@example.test',
        'contact_number' => '09171234567',
    ]);
    $ticketMediaId = agaDeletionMedia($ticket, 'support_ticket_attachments');

    $reply = SupportTicketReply::query()->create([
        'ticket_id' => $ticket->id,
        'user_id' => $user->id,
        'is_staff' => false,
        'body' => 'Retained citizen reply.',
    ]);

    $feedback = FeedbackSubmission::query()->create([
        'municipal_id' => $municipality->id,
        'user_id' => $user->id,
        'citizen_name' => 'Citizen Name',
        'contact_number' => '09171234567',
        'email' => 'citizen@example.test',
        'subject' => 'Retained feedback',
        'message' => 'The feedback record remains.',
        'is_anonymous' => false,
    ]);

    $householdId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    DB::table('ac_households')->insert([
        'id' => $householdId,
        'municipal_id' => $municipality->id,
        'barangay' => 'Barangay Test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'household_id' => $householdId,
        'user_id' => $user->id,
        'municipal_id' => $municipality->id,
        'first_name' => 'Retained',
        'last_name' => 'Beneficiary',
        'birth_date' => '1990-01-01',
        'terms_consented_at' => now(),
        'terms_version' => '1.0',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('verification_codes')->insert([
        'id' => (string) Str::ulid(),
        'code' => '123456',
        'receiver' => $user->email,
        'purpose' => 'login',
        'channel' => 'email',
        'expires_at' => now()->addMinutes(10),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('password_reset_tokens')->insert([
        'phone' => $user->phone,
        'token' => 'reset-token',
        'created_at' => now(),
    ]);
    DB::table('login_attempts')->insert([
        'identifier' => $user->email,
        'ip_address' => '127.0.0.1',
        'successful' => true,
        'user_agent' => 'Pest',
        'attempted_at' => now(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('activity_log')->insert([
        'log_name' => 'test',
        'description' => 'Retained activity',
        'causer_type' => $user->getMorphClass(),
        'causer_id' => $user->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertOk()
        ->assertExactJson([
            'message' => 'Laravel account cleanup completed.',
        ]);

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
    $this->assertDatabaseMissing('user_social_accounts', ['id' => $socialAccount->id]);
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->id]);
    $this->assertDatabaseMissing('model_has_roles', ['model_id' => $user->id]);

    $this->assertDatabaseHas('report_submissions', [
        'id' => $report->id,
        'user_id' => null,
        'is_anonymous' => true,
    ]);
    $this->assertDatabaseHas('support_tickets', [
        'id' => $ticket->id,
        'user_id' => null,
        'contact_name' => null,
        'contact_email' => null,
        'contact_number' => null,
    ]);
    $this->assertDatabaseHas('support_ticket_replies', [
        'id' => $reply->id,
        'user_id' => null,
    ]);
    $this->assertDatabaseHas('feedback_submissions', [
        'id' => $feedback->id,
        'user_id' => null,
        'citizen_name' => null,
        'contact_number' => null,
        'email' => null,
        'is_anonymous' => true,
    ]);
    $this->assertDatabaseHas('ac_beneficiaries', [
        'id' => $beneficiaryId,
        'user_id' => null,
    ]);
    $this->assertDatabaseHas('media', ['id' => $reportMediaId]);
    $this->assertDatabaseHas('media', ['id' => $ticketMediaId]);

    $this->assertDatabaseMissing('verification_codes', ['receiver' => $user->email]);
    $this->assertDatabaseMissing('password_reset_tokens', ['phone' => $user->phone]);
    $this->assertDatabaseMissing('login_attempts', ['identifier' => $user->email]);
    $this->assertDatabaseHas('activity_log', [
        'description' => 'Retained activity',
        'causer_type' => null,
        'causer_id' => null,
    ]);

    $this->withToken($createdToken->plainTextToken)
        ->getJson('/api/v1/community-reports/submission-context')
        ->assertUnauthorized();

    // A retry after the social link and user were deleted remains successful.
    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertOk();
});

it('unlinks AGA without deleting an administrative account', function () {
    $municipality = agaDeletionMunicipality();
    $admin = agaDeletionUser(EnumRoles::ADMIN, $municipality->id);
    $supabaseUserId = (string) Str::uuid();
    $socialAccount = agaDeletionSocialAccount($admin, $supabaseUserId);
    $token = $admin->createToken('AGA iOS App')->accessToken;

    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertOk();

    $this->assertDatabaseHas('users', [
        'id' => $admin->id,
        'municipal_id' => $municipality->id,
        'deactivated_at' => null,
    ]);
    $this->assertDatabaseHas('model_has_roles', ['model_id' => $admin->id]);
    $this->assertDatabaseMissing('user_social_accounts', ['id' => $socialAccount->id]);
    $this->assertDatabaseMissing('personal_access_tokens', ['id' => $token->id]);
});

it('rolls back when a citizen has restricted cemetery administrative history', function () {
    $municipality = agaDeletionMunicipality();
    $user = agaDeletionUser(EnumRoles::CLIENT);
    $supabaseUserId = (string) Str::uuid();
    $socialAccount = agaDeletionSocialAccount($user, $supabaseUserId);
    $token = $user->createToken('AGA iOS App')->accessToken;
    $decedentId = (string) Str::ulid();

    DB::table('cemetery_decedents')->insert([
        'id' => $decedentId,
        'municipal_id' => $municipality->id,
        'date_of_registration' => '2026-01-01',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('cemetery_interment_readiness_overrides')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipality->id,
        'decedent_id' => $decedentId,
        'missing_requirements' => '[]',
        'reason' => 'Test restricted history',
        'evidence_reference' => 'TEST-001',
        'created_by' => $user->id,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => $supabaseUserId,
        ])
        ->assertConflict()
        ->assertJsonPath('message', 'Account deletion requires administrative review.');

    $this->assertDatabaseHas('users', ['id' => $user->id]);
    $this->assertDatabaseHas('user_social_accounts', ['id' => $socialAccount->id]);
    $this->assertDatabaseHas('personal_access_tokens', ['id' => $token->id]);
});

it('is successful when the Supabase account was never linked or was already processed', function () {
    $this->withHeader('x-laravel-secret', 'aga-test-secret')
        ->deleteJson('/api/v1/integrations/aga/account', [
            'supabase_user_id' => (string) Str::uuid(),
        ])
        ->assertOk()
        ->assertExactJson([
            'message' => 'Laravel account cleanup completed.',
        ]);
});
