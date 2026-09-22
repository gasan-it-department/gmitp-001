<?php

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\BeneficiaryCooldown;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function (): void {
    activity()->enableLogging();

    Schema::create('municipalities', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug')->unique();
        $table->string('municipal_code')->unique();
        $table->boolean('is_active')->default(true);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->boolean('is_independent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id')->nullable();
        $table->ulid('assistance_type_id');
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->string('release_reference_number')->nullable();
        $table->json('metadata')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_beneficiary_cooldowns', function (Blueprint $table): void {
        $table->ulid('id')->primary();
        $table->ulid('beneficiary_id');
        $table->ulid('assistance_type_id');
        $table->ulid('assistance_request_id');
        $table->ulid('household_member_id')->nullable();
        $table->ulid('household_id')->nullable();
        $table->timestamp('cooldown_starts_at');
        $table->timestamp('cooldown_expires_at')->nullable();
        $table->timestamps();
    });

    Schema::create('activity_log', function (Blueprint $table): void {
        $table->id();
        $table->string('log_name')->nullable()->index();
        $table->text('description');
        $table->nullableUlidMorphs('subject', 'subject');
        $table->string('event')->nullable();
        $table->nullableUlidMorphs('causer', 'causer');
        $table->json('attribute_changes')->nullable();
        $table->json('properties')->nullable();
        $table->timestamps();
    });
});

afterEach(function (): void {
    activity()->enableLogging();

    foreach ([
        'activity_log',
        'ac_beneficiary_cooldowns',
        'ac_assistance_requests',
        'ac_assistance_types',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('keeps the default and explicit dry run read only', function (): void {
    $context = repairCooldownContext();
    $requestId = repairCooldownRequest(
        $context,
        'REQ-DRY-RUN',
        ['cooldown_policy' => repairCooldownPolicy($context, 'per_beneficiary')],
    );
    $rowId = repairCooldownRow($context, $requestId, householdId: null);

    $beforeType = DB::table('ac_assistance_types')->where('id', $context['type_id'])->first();
    $beforeRequest = DB::table('ac_assistance_requests')->where('id', $requestId)->first();
    $beforeRow = DB::table('ac_beneficiary_cooldowns')->where('id', $rowId)->first();

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--municipality' => 'gasan-4905',
    ])->assertSuccessful();

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--municipality' => 'gasan-4905',
        '--dry-run' => true,
    ])->assertSuccessful();

    expect(DB::table('ac_assistance_types')->where('id', $context['type_id'])->first())
        ->toEqual($beforeType)
        ->and(DB::table('ac_assistance_requests')->where('id', $requestId)->first())
        ->toEqual($beforeRequest)
        ->and(DB::table('ac_beneficiary_cooldowns')->where('id', $rowId)->first())
        ->toEqual($beforeRow)
        ->and(DB::table('activity_log')->count())->toBe(0);
});

it('repairs historical household scope without changing release or cooldown dates', function (): void {
    $context = repairCooldownContext();
    $otherMunicipality = repairCooldownMunicipality('boac-4901', '174001000');
    $otherContext = repairCooldownContext($otherMunicipality, 'OTHER MEDICAL', 'other-medical');

    $frozenRequestId = repairCooldownRequest(
        $context,
        'REQ-FROZEN-PERSONAL',
        [
            'unrelated_key' => 'preserve-me',
            'cooldown_policy' => repairCooldownPolicy($context, 'per_beneficiary'),
        ],
    );
    $frozenRowId = repairCooldownRow($context, $frozenRequestId, householdId: null);

    $legacyRequestId = repairCooldownRequest($context, 'REQ-LEGACY-POLICY', null);
    repairCooldownRow(
        $context,
        $legacyRequestId,
        householdId: $context['household_id'],
        startsAt: '2026-01-31 08:00:00',
        expiresAt: '2026-04-30 08:00:00',
    );

    $zeroTypeId = repairCooldownType($context['municipal_id'], 'Food Assistance', 'food', 0);
    $zeroContext = array_merge($context, ['type_id' => $zeroTypeId]);
    $zeroRequestId = repairCooldownRequest($zeroContext, 'REQ-ZERO-MONTH', null);

    $alreadyHouseholdId = repairCooldownRequest(
        $context,
        'REQ-ALREADY-HOUSEHOLD',
        ['cooldown_policy' => repairCooldownPolicy($context, 'per_household')],
    );
    repairCooldownRow($context, $alreadyHouseholdId, householdId: $context['household_id']);

    $otherRequestId = repairCooldownRequest(
        $otherContext,
        'REQ-OTHER-TENANT',
        ['cooldown_policy' => repairCooldownPolicy($otherContext, 'per_beneficiary')],
    );
    repairCooldownRow($otherContext, $otherRequestId, householdId: null);

    $beforeFrozen = AssistanceRequest::query()->findOrFail($frozenRequestId);
    $beforeFrozenRow = BeneficiaryCooldown::query()->findOrFail($frozenRowId);
    $beforeUpdatedAt = $beforeFrozen->updated_at?->toIso8601String();
    $beforeReleasedAt = $beforeFrozen->released_at?->toIso8601String();
    $beforeStartsAt = $beforeFrozenRow->cooldown_starts_at?->toIso8601String();
    $beforeExpiresAt = $beforeFrozenRow->cooldown_expires_at?->toIso8601String();

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--municipality' => 'gasan-4905',
        '--apply' => true,
    ])->assertSuccessful();

    $type = AssistanceType::query()->findOrFail($context['type_id']);
    $zeroType = AssistanceType::query()->findOrFail($zeroTypeId);
    $frozen = AssistanceRequest::query()->findOrFail($frozenRequestId);
    $legacy = AssistanceRequest::query()->findOrFail($legacyRequestId);
    $zero = AssistanceRequest::query()->findOrFail($zeroRequestId);
    $frozenRow = BeneficiaryCooldown::query()->findOrFail($frozenRowId);

    expect($type->cooldown_scope)->toBe('per_household')
        ->and($type->is_independent)->toBeFalse()
        ->and($zeroType->cooldown_scope)->toBe('per_household')
        ->and(data_get($frozen->metadata, 'unrelated_key'))->toBe('preserve-me')
        ->and(data_get($frozen->metadata, 'cooldown_policy.scope'))->toBe('per_household')
        ->and(data_get($frozen->metadata, 'cooldown_policy.household_id'))->toBe($context['household_id'])
        ->and(data_get($frozen->metadata, 'cooldown_policy.captured_beneficiary_ids'))
        ->toBe([$context['beneficiary_id']])
        ->and(data_get($frozen->metadata, 'cooldown_scope_repair.previous_scope'))->toBe('per_beneficiary')
        ->and(data_get($frozen->metadata, 'cooldown_scope_repair.source'))
        ->toBe('action-center:repair-released-household-cooldowns')
        ->and(data_get($legacy->metadata, 'cooldown_policy.scope'))->toBe('per_household')
        ->and(data_get($legacy->metadata, 'cooldown_policy.household_id'))->toBe($context['household_id'])
        ->and(data_get($legacy->metadata, 'cooldown_policy.type'))->toBeNull()
        ->and(data_get($legacy->metadata, 'cooldown_policy.months'))->toBeNull()
        ->and(data_get($zero->metadata, 'cooldown_policy.scope'))->toBe('per_household')
        ->and(BeneficiaryCooldown::query()->where('assistance_request_id', $zeroRequestId)->count())->toBe(0)
        ->and($frozenRow->household_id)->toBe($context['household_id'])
        ->and($frozen->status->value)->toBe('released')
        ->and($frozen->amount_approved)->toBe('4000.00')
        ->and($frozen->release_reference_number)->toBe('REL-REQ-FROZEN-PERSONAL')
        ->and($frozen->updated_at?->toIso8601String())->toBe($beforeUpdatedAt)
        ->and($frozen->released_at?->toIso8601String())->toBe($beforeReleasedAt)
        ->and($frozenRow->cooldown_starts_at?->toIso8601String())->toBe($beforeStartsAt)
        ->and($frozenRow->cooldown_expires_at?->toIso8601String())->toBe($beforeExpiresAt);

    $otherType = AssistanceType::query()->findOrFail($otherContext['type_id']);
    $otherRequest = AssistanceRequest::query()->findOrFail($otherRequestId);
    expect($otherType->cooldown_scope)->toBe('per_beneficiary')
        ->and(data_get($otherRequest->metadata, 'cooldown_policy.scope'))->toBe('per_beneficiary');

    $activityCount = DB::table('activity_log')->count();
    expect($activityCount)->toBe(5);

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--municipality' => 'gasan-4905',
        '--apply' => true,
    ])->assertSuccessful();

    expect(DB::table('activity_log')->count())->toBe($activityCount);
});

it('rolls back every repair when any released request has a blocking anomaly', function (): void {
    $context = repairCooldownContext();
    $validRequestId = repairCooldownRequest(
        $context,
        'REQ-VALID',
        ['cooldown_policy' => repairCooldownPolicy($context, 'per_beneficiary')],
    );
    $validRowId = repairCooldownRow($context, $validRequestId, householdId: null);

    $conflictingRequestId = repairCooldownRequest(
        $context,
        'REQ-CONFLICT',
        ['cooldown_policy' => repairCooldownPolicy($context, 'per_beneficiary')],
    );
    repairCooldownRow($context, $conflictingRequestId, householdId: (string) Str::ulid());

    $oneTimeTypeId = repairCooldownType(
        $context['municipal_id'],
        'One-Time Assistance',
        'one-time',
        0,
        'one_time',
    );
    $oneTimeContext = array_merge($context, ['type_id' => $oneTimeTypeId]);
    repairCooldownRequest($oneTimeContext, 'REQ-MISSING-PERMANENT-ROW', [
        'cooldown_policy' => repairCooldownPolicy($oneTimeContext, 'per_beneficiary', 'one_time', 0),
    ]);

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--municipality' => 'gasan-4905',
        '--apply' => true,
    ])->assertFailed();

    expect(AssistanceType::query()->findOrFail($context['type_id'])->cooldown_scope)
        ->toBe('per_beneficiary')
        ->and(AssistanceType::query()->findOrFail($context['type_id'])->is_independent)->toBeTrue()
        ->and(data_get(
            AssistanceRequest::query()->findOrFail($validRequestId)->metadata,
            'cooldown_policy.scope',
        ))->toBe('per_beneficiary')
        ->and(BeneficiaryCooldown::query()->findOrFail($validRowId)->household_id)->toBeNull()
        ->and(DB::table('activity_log')->count())->toBe(0);
});

it('requires an explicit municipality before applying', function (): void {
    repairCooldownContext();

    $this->artisan('action-center:repair-released-household-cooldowns', [
        '--apply' => true,
    ])->assertExitCode(2);
});

/** @return array{municipal_id:string,type_id:string,beneficiary_id:string,household_id:string} */
function repairCooldownContext(
    ?string $municipalId = null,
    string $typeName = 'Medical Assistance',
    string $typeSlug = 'medical',
): array {
    $municipalId ??= repairCooldownMunicipality('gasan-4905', '174003000');

    return [
        'municipal_id' => $municipalId,
        'type_id' => repairCooldownType($municipalId, $typeName, $typeSlug, 3, independent: true),
        'beneficiary_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
    ];
}

function repairCooldownMunicipality(string $slug, string $code): string
{
    $id = (string) Str::ulid();
    DB::table('municipalities')->insert([
        'id' => $id,
        'name' => str($slug)->before('-')->upper()->toString(),
        'slug' => $slug,
        'municipal_code' => $code,
        'is_active' => true,
        'created_at' => '2026-09-21 08:00:00',
        'updated_at' => '2026-09-21 08:00:00',
    ]);

    return $id;
}

function repairCooldownType(
    string $municipalId,
    string $name,
    string $slug,
    int $months,
    string $type = 'per_request',
    bool $independent = false,
): string {
    $id = (string) Str::ulid();
    DB::table('ac_assistance_types')->insert([
        'id' => $id,
        'municipal_id' => $municipalId,
        'name' => $name,
        'slug' => $slug,
        'is_active' => true,
        'cooldown_months' => $months,
        'cooldown_type' => $type,
        'cooldown_scope' => 'per_beneficiary',
        'is_independent' => $independent,
        'created_at' => '2026-09-21 08:00:00',
        'updated_at' => '2026-09-21 08:00:00',
    ]);

    return $id;
}

/** @param array<string, mixed>|null $metadata */
function repairCooldownRequest(array $context, string $transaction, ?array $metadata): string
{
    $id = (string) Str::ulid();
    DB::table('ac_assistance_requests')->insert([
        'id' => $id,
        'municipal_id' => $context['municipal_id'],
        'beneficiary_id' => $context['beneficiary_id'],
        'household_id' => $context['household_id'],
        'assistance_type_id' => $context['type_id'],
        'transaction_number' => $transaction,
        'status' => 'released',
        'amount_approved' => 4000,
        'approved_at' => '2026-07-10 08:00:00',
        'released_at' => '2026-08-23 08:00:00',
        'release_reference_number' => "REL-{$transaction}",
        'metadata' => $metadata === null ? null : json_encode($metadata, JSON_THROW_ON_ERROR),
        'created_at' => '2026-07-10 08:00:00',
        'updated_at' => '2026-08-23 08:00:00',
    ]);

    return $id;
}

function repairCooldownRow(
    array $context,
    string $requestId,
    ?string $householdId,
    string $startsAt = '2026-07-10 08:00:00',
    ?string $expiresAt = '2026-10-10 08:00:00',
): string {
    $id = (string) Str::ulid();
    DB::table('ac_beneficiary_cooldowns')->insert([
        'id' => $id,
        'beneficiary_id' => $context['beneficiary_id'],
        'assistance_type_id' => $context['type_id'],
        'assistance_request_id' => $requestId,
        'household_member_id' => null,
        'household_id' => $householdId,
        'cooldown_starts_at' => $startsAt,
        'cooldown_expires_at' => $expiresAt,
        'created_at' => $startsAt,
        'updated_at' => $startsAt,
    ]);

    return $id;
}

/** @return array<string, mixed> */
function repairCooldownPolicy(
    array $context,
    string $scope,
    string $type = 'per_request',
    int $months = 3,
): array {
    return [
        'type' => $type,
        'scope' => $scope,
        'months' => $months,
        'released_at' => '2026-08-23T08:00:00+08:00',
        'household_id' => $context['household_id'],
        'captured_household_member_ids' => [],
        'captured_beneficiary_ids' => [$context['beneficiary_id']],
    ];
}
