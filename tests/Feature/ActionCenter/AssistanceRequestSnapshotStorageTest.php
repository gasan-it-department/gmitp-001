<?php

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestDetailsResource;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();

    Schema::create('ac_religions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('user_id')->nullable();
        $table->ulid('household_id');
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date');
        $table->ulid('religion_id')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->string('contact_phone', 20)->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('relationship')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('name');
        $table->string('slug');
        $table->boolean('is_independent')->default(false);
        $table->decimal('min_amount', 10, 2)->default(0);
        $table->decimal('max_amount', 10, 2)->nullable();
        $table->unsignedInteger('cooldown_months')->default(0);
        $table->string('cooldown_type')->default('per_request');
        $table->string('cooldown_scope')->default('per_beneficiary');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->ulid('beneficiary_id');
        $table->ulid('household_id');
        $table->ulid('assistance_type_id');
        $table->ulid('encoded_by_user_id')->nullable();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->json('metadata')->nullable();
        $table->string('transaction_number')->unique();
        $table->string('status');
        $table->text('description')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamp('privacy_consented_at');
        $table->string('privacy_notice_version');
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_request_snapshots', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_request_id')->unique();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('religion')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->nullable();
        $table->decimal('household_total_income', 10, 2)->nullable();
        $table->string('barangay')->nullable();
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_request_sequences', function (Blueprint $table) {
        $table->id();
        $table->unsignedSmallInteger('year')->unique();
        $table->unsignedInteger('last_seq')->default(0);
        $table->timestamps();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->string('model_id');
        $table->string('collection_name');
        $table->unsignedInteger('order_column')->nullable();
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'media',
        'ac_request_sequences',
        'ac_assistance_request_snapshots',
        'ac_assistance_requests',
        'ac_assistance_types',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_households',
        'ac_religions',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('stores snapshots and permits one newly declared pending member', function () {
    $municipalId = (string) Str::ulid();
    $householdId = (string) Str::ulid();
    $beneficiaryId = (string) Str::ulid();
    $assistanceTypeId = (string) Str::ulid();
    $memberId = (string) Str::ulid();
    $headMemberId = (string) Str::ulid();
    $submitterUserId = (string) Str::ulid();
    $now = now();

    DB::table('ac_households')->insert([
        'id' => $householdId,
        'municipal_id' => $municipalId,
        'barangay' => 'Barangay Uno',
        'barangay_psgc_code' => '1234567890',
        'street' => 'Rizal Street',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_beneficiaries')->insert([
        'id' => $beneficiaryId,
        'user_id' => $submitterUserId,
        'household_id' => $householdId,
        'municipal_id' => $municipalId,
        'is_active' => true,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'civil_status' => 'single',
        'occupation' => 'Farmer',
        'monthly_income' => 2500,
        'identity_verified_at' => $now,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_types')->insert([
        'id' => $assistanceTypeId,
        'municipal_id' => $municipalId,
        'name' => 'Burial Assistance',
        'slug' => 'burial',
        'is_independent' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_household_members')->insert([
        'id' => $headMemberId,
        'household_id' => $householdId,
        'beneficiary_id' => $beneficiaryId,
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'relationship' => 'head',
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_household_members')->insert([
        'id' => $memberId,
        'household_id' => $householdId,
        'beneficiary_id' => null,
        'first_name' => 'Pedro',
        'last_name' => 'Dela Cruz',
        'relationship' => 'parent',
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $idGenerator = new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    };

    $created = (new StoreAssistanceRequestAction($idGenerator))->execute(
        new StoreAssistanceRequestDto(
            municipalId: $municipalId,
            beneficiaryId: $beneficiaryId,
            householdId: $householdId,
            assistanceTypeId: $assistanceTypeId,
            submitterUserId: $submitterUserId,
            encodedByUserId: null,
            description: 'Burial assistance request for a verified family member.',
            verificationOverrideReason: null,
            privacyConsentedAt: CarbonImmutable::now(),
            privacyNoticeVersion: 'v1.0',
            relationshipToBeneficiary: 'parent',
            onBehalfHouseholdMemberId: $memberId,
            onBehalfFirstName: 'Forged',
            onBehalfMiddleName: null,
            onBehalfLastName: 'Name',
            onBehalfSuffix: null,
            onBehalfDateOfDeath: '2026-06-01',
            snapshotFirstName: 'Juan',
            snapshotLastName: 'Dela Cruz',
            snapshotMiddleName: null,
            snapshotSuffix: null,
            snapshotSex: 'male',
            snapshotBirthDate: '1990-01-01',
            snapshotEducationalAttainment: 'High School',
            snapshotReligion: null,
            snapshotBarangay: 'Barangay Uno',
            snapshotBarangayPsgcCode: '1234567890',
            snapshotStreet: 'Rizal Street',
            documents: [],
        ),
    );

    $payload = (new AssistanceRequestDetailsResource($created))->resolve();

    expect(DB::table('ac_assistance_requests')->count())->toBe(1)
        ->and(DB::table('ac_assistance_request_snapshots')->count())->toBe(1)
        ->and($created->metadata)->toMatchArray([
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'Pedro',
            'on_behalf_last_name' => 'Dela Cruz',
            'on_behalf_date_of_death' => '2026-06-01',
            'on_behalf_verification_pending' => true,
        ])
        ->and($created->snapshot->first_name)->toBe('Juan')
        ->and($created->snapshot_first_name)->toBe('Juan')
        ->and($created->on_behalf_first_name)->toBe('Pedro')
        ->and($payload['identity_snapshot']['full_name'])->toBe('Juan Dela Cruz')
        ->and($payload['on_behalf']['full_name'])->toBe('Pedro Dela Cruz')
        ->and(Schema::hasColumn('ac_assistance_requests', 'snapshot_first_name'))->toBeFalse()
        ->and(Schema::hasColumn('ac_assistance_requests', 'on_behalf_first_name'))->toBeFalse();
});
