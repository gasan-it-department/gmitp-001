<?php

use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\UseCase\Assistance\Client\ShowClientAssistanceRequestAction;
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
        $table->date('birth_date')->nullable();
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

    Schema::create('ac_document_types', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('key')->unique();
        $table->string('label');
        $table->boolean('is_active')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_assistance_type_documents', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('assistance_type_id');
        $table->ulid('document_type_id');
        $table->boolean('is_required')->default(true);
        $table->unsignedInteger('sort_order')->default(0);
        $table->timestamps();
        $table->unique(['assistance_type_id', 'document_type_id']);
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
        'ac_assistance_type_documents',
        'ac_document_types',
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
            recipientIdUnavailable: false,
            recipientIdUnavailableReason: null,
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
            'recipient_id_exception' => 'deceased',
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

it('allows an adult portal on-behalf request without recipient id uploads', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(snapshotTestIdGenerator()))
        ->execute(adultOnBehalfDto($context));
    $details = (new ShowClientAssistanceRequestAction)->execute(
        $context['submitter_user_id'],
        $created->id,
        $context['municipal_id'],
    );
    $payload = (new AssistanceRequestDetailsResource($details))->resolve();

    expect(DB::table('ac_assistance_requests')->count())->toBe(1)
        ->and($created->status->value)->toBe('pending')
        ->and($created->media)->toBeEmpty()
        ->and($created->recipient_id_exception)->toBeNull()
        ->and($payload['assistance_type']['documents'])->toHaveCount(4)
        ->and(collect($payload['assistance_type']['documents'])->pluck('key')->all())
        ->toContain('valid_id_front', 'recipient_valid_id_front');
});

it('stores a documented no-id exception for an adult assisted person', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(snapshotTestIdGenerator()))->execute(
        adultOnBehalfDto(
            $context,
            recipientIdUnavailable: true,
            recipientIdUnavailableReason: 'The assisted adult has not been issued a government ID.',
        ),
    );

    expect($created->metadata)->toMatchArray([
        'on_behalf_birth_date' => '1980-02-03',
        'recipient_id_exception' => 'no_government_id',
        'recipient_id_exception_reason' => 'The assisted adult has not been issued a government ID.',
    ]);
});

it('allows an admin to file for a pending household member with an override and trusts the roster relationship', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(snapshotTestIdGenerator()))->execute(
        adultOnBehalfDto(
            $context,
            encodedByUserId: $context['submitter_user_id'],
            verificationOverrideReason: 'The member was interviewed at the MSWD desk during an urgent request.',
            relationshipToBeneficiary: 'sibling',
        ),
    );

    expect($created->encoded_by_user_id)->toBe($context['submitter_user_id'])
        ->and($created->on_behalf_household_member_id)->toBe($context['member_id'])
        ->and($created->metadata)->toMatchArray([
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'Pedro',
            'on_behalf_verification_pending' => true,
        ]);
});

function seedAdultOnBehalfIdentityContext(): array
{
    $context = [
        'municipal_id' => (string) Str::ulid(),
        'household_id' => (string) Str::ulid(),
        'beneficiary_id' => (string) Str::ulid(),
        'assistance_type_id' => (string) Str::ulid(),
        'member_id' => (string) Str::ulid(),
        'head_member_id' => (string) Str::ulid(),
        'submitter_user_id' => (string) Str::ulid(),
    ];
    $now = now();

    DB::table('ac_households')->insert([
        'id' => $context['household_id'],
        'municipal_id' => $context['municipal_id'],
        'barangay' => 'Barangay Uno',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_beneficiaries')->insert([
        'id' => $context['beneficiary_id'],
        'user_id' => $context['submitter_user_id'],
        'household_id' => $context['household_id'],
        'municipal_id' => $context['municipal_id'],
        'is_active' => true,
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'birth_date' => '1990-01-01',
        'monthly_income' => 0,
        'identity_verified_at' => $now,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_assistance_types')->insert([
        'id' => $context['assistance_type_id'],
        'municipal_id' => $context['municipal_id'],
        'name' => 'Medical Assistance',
        'slug' => 'medical',
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_household_members')->insert([
        [
            'id' => $context['head_member_id'],
            'household_id' => $context['household_id'],
            'beneficiary_id' => $context['beneficiary_id'],
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'birth_date' => '1990-01-01',
            'relationship' => 'head',
            'is_active' => true,
            'is_verified_dependent' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ],
        [
            'id' => $context['member_id'],
            'household_id' => $context['household_id'],
            'beneficiary_id' => null,
            'first_name' => 'Pedro',
            'last_name' => 'Santos',
            'birth_date' => '1980-02-03',
            'relationship' => 'parent',
            'is_active' => true,
            'is_verified_dependent' => false,
            'created_at' => $now,
            'updated_at' => $now,
        ],
    ]);

    foreach ([
        ['key' => 'valid_id_front', 'label' => 'Filer Valid Government ID - Front', 'required' => true],
        ['key' => 'valid_id_back', 'label' => 'Filer Valid Government ID - Back', 'required' => true],
        ['key' => 'recipient_valid_id_front', 'label' => 'Assisted Person Valid Government ID - Front', 'required' => false],
        ['key' => 'recipient_valid_id_back', 'label' => 'Assisted Person Valid Government ID - Back', 'required' => false],
    ] as $index => $document) {
        $documentId = (string) Str::ulid();
        DB::table('ac_document_types')->insert([
            'id' => $documentId,
            'key' => $document['key'],
            'label' => $document['label'],
            'sort_order' => $index + 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('ac_assistance_type_documents')->insert([
            'id' => (string) Str::ulid(),
            'assistance_type_id' => $context['assistance_type_id'],
            'document_type_id' => $documentId,
            'is_required' => $document['required'],
            'sort_order' => $index + 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
    }

    return $context;
}

function adultOnBehalfDto(
    array $context,
    bool $recipientIdUnavailable = false,
    ?string $recipientIdUnavailableReason = null,
    ?string $encodedByUserId = null,
    ?string $verificationOverrideReason = null,
    string $relationshipToBeneficiary = 'parent',
): StoreAssistanceRequestDto {
    return new StoreAssistanceRequestDto(
        municipalId: $context['municipal_id'],
        beneficiaryId: $context['beneficiary_id'],
        householdId: $context['household_id'],
        assistanceTypeId: $context['assistance_type_id'],
        submitterUserId: $context['submitter_user_id'],
        encodedByUserId: $encodedByUserId,
        description: 'Medical assistance requested for an adult household member.',
        verificationOverrideReason: $verificationOverrideReason,
        privacyConsentedAt: CarbonImmutable::now(),
        privacyNoticeVersion: 'v1.0',
        relationshipToBeneficiary: $relationshipToBeneficiary,
        onBehalfHouseholdMemberId: $context['member_id'],
        onBehalfFirstName: 'Pedro',
        onBehalfMiddleName: null,
        onBehalfLastName: 'Santos',
        onBehalfSuffix: null,
        onBehalfDateOfDeath: null,
        recipientIdUnavailable: $recipientIdUnavailable,
        recipientIdUnavailableReason: $recipientIdUnavailableReason,
        snapshotFirstName: 'Maria',
        snapshotLastName: 'Santos',
        snapshotMiddleName: null,
        snapshotSuffix: null,
        snapshotSex: 'female',
        snapshotBirthDate: '1990-01-01',
        snapshotEducationalAttainment: null,
        snapshotReligion: null,
        snapshotBarangay: 'Barangay Uno',
        snapshotBarangayPsgcCode: null,
        snapshotStreet: null,
        documents: [],
    );
}

function snapshotTestIdGenerator(): IdGeneratorInterface
{
    return new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    };
}
