<?php

use App\Core\ActionCenter\Contracts\AssistanceRequestFormDefinitionProvider;
use App\Core\ActionCenter\Dto\Assistance\RejectAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Assistance\StoreAssistanceRequestDto;
use App\Core\ActionCenter\Dto\Beneficiary\BeneficiaryIdentityGroup;
use App\Core\ActionCenter\Dto\Beneficiary\EligibilityResult;
use App\Core\ActionCenter\Exceptions\AssistanceEligibilityException;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Services\AssistanceRequestSmsNotifier;
use App\Core\ActionCenter\UseCase\Assistance\Client\ShowClientAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\RejectAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Assistance\StoreAssistanceRequestAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;
use App\Core\ActionCenter\UseCase\Shared\LockAssistanceRequestAction;
use App\External\Api\Request\ActionCenter\StoreAdminAssistanceRequest;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestDetailsResource;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\ClientAssistanceRequestDetailsResource;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
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
        $table->string('physical_copy_requirement')->default('unspecified');
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
        $table->text('remarks')->nullable();
        $table->ulid('reviewed_by_user_id')->nullable();
        $table->ulid('rejected_by_user_id')->nullable();
        $table->decimal('amount_approved', 10, 2)->nullable();
        $table->timestamp('reviewed_at')->nullable();
        $table->timestamp('approved_at')->nullable();
        $table->timestamp('released_at')->nullable();
        $table->timestamp('rejected_at')->nullable();
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

    Schema::create('ac_beneficiary_flags', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('beneficiary_id');
        $table->string('severity');
        $table->timestamp('expires_at')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_beneficiary_cooldowns', function (Blueprint $table) {
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
        'ac_beneficiary_cooldowns',
        'ac_beneficiary_flags',
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

it('allows an admin to open a walk-in assistance case without documents', function () {
    $context = seedAdultOnBehalfIdentityContext();
    $payload = [
        'beneficiary_id' => $context['beneficiary_id'],
        'assistance_type_id' => $context['assistance_type_id'],
        'description' => 'Medical assistance requested during an MSWD walk-in interview.',
        'privacy_consent' => true,
    ];
    $request = StoreAdminAssistanceRequest::create('/', 'POST', $payload);

    $validator = Validator::make($payload, $request->rules(), $request->messages());

    expect($validator->passes())->toBeTrue();
});

it('accepts a valid optional document supplied during walk-in encoding', function () {
    $context = seedAdultOnBehalfIdentityContext();
    $payload = [
        'beneficiary_id' => $context['beneficiary_id'],
        'assistance_type_id' => $context['assistance_type_id'],
        'description' => 'Medical assistance requested during an MSWD walk-in interview.',
        'privacy_consent' => true,
        'documents' => [
            'valid_id_front' => UploadedFile::fake()->image('valid-id-front.jpg'),
        ],
    ];
    $request = StoreAdminAssistanceRequest::create('/', 'POST', $payload, [], $payload['documents']);

    $validator = Validator::make($payload, $request->rules(), $request->messages());

    expect($validator->passes())->toBeTrue();
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

    $created = (new StoreAssistanceRequestAction(
        $idGenerator,
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(
        new StoreAssistanceRequestDto(
            municipalId: $municipalId,
            municipalCode: '174003000',
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
        ->and($created->transaction_number)->toMatch('/^REQ-\d{4}-\d{4}$/')
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

    $created = (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))
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

it('keeps internal rejection remarks and staff data out of the citizen request payload', function () {
    $context = seedAdultOnBehalfIdentityContext();
    $reason = 'The submitted documents did not establish eligibility for this assistance.';

    $created = (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))
        ->execute(adultOnBehalfDto($context));

    $created->update([
        'status' => 'under_review',
        'reviewed_by_user_id' => $context['submitter_user_id'],
        'reviewed_at' => now(),
        'remarks' => 'Internal assessment details that the citizen must not see.',
    ]);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldReceive('requestRejected')->once();

    $rejected = (new RejectAssistanceRequestAction(
        new LockAssistanceRequestAction,
        $smsNotifier,
    ))->execute(new RejectAssistanceRequestDto(
        assistanceRequestId: $created->id,
        municipalId: $context['municipal_id'],
        rejectedByUserId: $context['submitter_user_id'],
        rejectedByUserName: 'Action Center Reviewer',
        remarks: $reason,
    ));

    $details = (new ShowClientAssistanceRequestAction)->execute(
        $context['submitter_user_id'],
        $rejected->id,
        $context['municipal_id'],
    );
    $clientPayload = (new ClientAssistanceRequestDetailsResource($details))->resolve();
    $adminPayload = (new AssistanceRequestDetailsResource($details))->resolve();

    expect($rejected->remarks)->toContain('Internal assessment details')
        ->and($rejected->remarks)->toContain($reason)
        ->and(array_key_exists('remarks', $clientPayload))->toBeFalse()
        ->and(array_key_exists('reviewed_by', $clientPayload))->toBeFalse()
        ->and(array_key_exists('approved_by', $clientPayload))->toBeFalse()
        ->and(array_key_exists('encoded_by', $clientPayload))->toBeFalse()
        ->and($adminPayload['remarks'])->toContain('Internal assessment details');
});

it('stores a documented no-id exception for an adult assisted person', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(
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

it('does not apply deceased metadata or id exemptions to an unconfigured program', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(adultOnBehalfDto(
        context: $context,
        onBehalfDateOfDeath: '2026-08-20',
    ));

    expect($created->recipient_id_exception)->toBeNull()
        ->and(data_get($created->metadata, 'on_behalf_date_of_death'))->toBeNull();
});

it('allows an admin to file for a pending household member with an override and trusts the roster relationship', function () {
    $context = seedAdultOnBehalfIdentityContext();

    $created = (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(
        adultOnBehalfDto(
            $context,
            encodedByUserId: $context['submitter_user_id'],
            verificationOverrideReason: 'The member was interviewed at the MSWD desk during an urgent request.',
            relationshipToBeneficiary: 'sibling',
        ),
    );

    expect($created->encoded_by_user_id)->toBe($context['submitter_user_id'])
        ->and($created->status->value)->toBe('pending')
        ->and(DB::table('media')->count())->toBe(0)
        ->and($created->on_behalf_household_member_id)->toBe($context['member_id'])
        ->and($created->metadata)->toMatchArray([
            'relationship_to_beneficiary' => 'parent',
            'on_behalf_first_name' => 'Pedro',
            'on_behalf_verification_pending' => true,
        ]);
});

it('rechecks citizen eligibility after acquiring submission locks', function () {
    $context = seedAdultOnBehalfIdentityContext();
    $dto = adultOnBehalfDto($context);

    (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute($dto);

    // This represents the second HTTP request after it waited for the first
    // transaction to commit. Its controller precheck may have been stale.
    $eligibility = Mockery::mock(CheckElegibilityAction::class);
    $eligibility->shouldReceive('execute')
        ->once()
        ->andReturnUsing(function () {
            expect(DB::transactionLevel())->toBeGreaterThan(0)
                ->and(DB::table('ac_assistance_requests')->count())->toBe(1);

            return EligibilityResult::inFlightRequest();
        });

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldNotReceive('requestReceived');

    $secondSubmission = new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        $smsNotifier,
        $eligibility,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

    expect(fn () => $secondSubmission->execute($dto))
        ->toThrow(AssistanceEligibilityException::class);

    expect(DB::table('ac_assistance_requests')->count())->toBe(1)
        ->and(DB::table('ac_request_sequences')->value('last_seq'))->toBe(1);
});

it('blocks another claimant from targeting a household member with an open standard request', function () {
    $context = seedAdultOnBehalfIdentityContext();

    (new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        snapshotTestSmsNotifier(),
        snapshotTestEligibility(),
        app(AssistanceRequestFormDefinitionProvider::class),
    ))->execute(adultOnBehalfDto($context));

    $secondBeneficiaryId = (string) Str::ulid();
    $now = now();

    DB::table('ac_beneficiaries')->insert([
        'id' => $secondBeneficiaryId,
        'user_id' => (string) Str::ulid(),
        'household_id' => $context['household_id'],
        'municipal_id' => $context['municipal_id'],
        'is_active' => true,
        'first_name' => 'Ana',
        'last_name' => 'Santos',
        'birth_date' => '1992-04-05',
        'monthly_income' => 0,
        'identity_verified_at' => $now,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $context['household_id'],
        'beneficiary_id' => $secondBeneficiaryId,
        'first_name' => 'Ana',
        'last_name' => 'Santos',
        'birth_date' => '1992-04-05',
        'relationship' => 'sibling',
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => $now,
        'updated_at' => $now,
    ]);

    $secondBeneficiary = Beneficiary::query()
        ->with('household')
        ->findOrFail($secondBeneficiaryId);
    $identityGroup = Mockery::mock(ResolveBeneficiaryIdentityGroupAction::class);
    $identityGroup->shouldReceive('execute')
        ->once()
        ->andReturn(new BeneficiaryIdentityGroup(
            canonical: $secondBeneficiary,
            beneficiaryIds: [$secondBeneficiaryId],
            householdIds: [$context['household_id']],
        ));

    $result = (new CheckElegibilityAction($identityGroup))->execute(
        $secondBeneficiary,
        AssistanceType::query()->findOrFail($context['assistance_type_id']),
        $context['member_id'],
        allowPendingDependent: true,
    );

    expect($result->eligible)->toBeFalse()
        ->and($result->reason)->toBe(EligibilityResult::REASON_IN_FLIGHT);
});

it('rejects burial assistance filed for self at the core action boundary', function () {
    $context = seedAdultOnBehalfIdentityContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance',
            'slug' => 'burial',
            'is_independent' => true,
        ]);

    $smsNotifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $smsNotifier->shouldNotReceive('requestReceived');
    $eligibility = Mockery::mock(CheckElegibilityAction::class);
    $eligibility->shouldNotReceive('execute');

    $action = new StoreAssistanceRequestAction(
        snapshotTestIdGenerator(),
        $smsNotifier,
        $eligibility,
        app(AssistanceRequestFormDefinitionProvider::class),
    );

    expect(fn () => $action->execute(adultOnBehalfDto(
        context: $context,
        filedForSelf: true,
    )))->toThrow(DomainException::class, 'must be filed on behalf of the deceased');

    expect(DB::table('ac_assistance_requests')->count())->toBe(0);
});

it('does not treat a cancelled off-roster burial approval as an active cooldown', function () {
    $context = seedAdultOnBehalfIdentityContext();
    DB::table('ac_assistance_types')
        ->where('id', $context['assistance_type_id'])
        ->update([
            'name' => 'Burial Assistance',
            'slug' => 'burial',
            'is_independent' => true,
            'cooldown_months' => 12,
        ]);

    DB::table('ac_assistance_requests')->insert([
        'id' => (string) Str::ulid(),
        'municipal_id' => $context['municipal_id'],
        'beneficiary_id' => $context['beneficiary_id'],
        'household_id' => $context['household_id'],
        'assistance_type_id' => $context['assistance_type_id'],
        'metadata' => json_encode(['on_behalf_date_of_death' => '2026-08-01']),
        'transaction_number' => 'REQ-2026-CANCELLED-BURIAL',
        'status' => 'cancelled',
        'description' => 'Cancelled burial request with an off-roster deceased person.',
        'amount_approved' => 5000,
        'approved_at' => now(),
        'privacy_consented_at' => now(),
        'privacy_notice_version' => 'v1.0',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $beneficiary = Beneficiary::query()
        ->with('household')
        ->findOrFail($context['beneficiary_id']);
    $type = AssistanceType::query()->findOrFail($context['assistance_type_id']);
    $resolver = Mockery::mock(ResolveBeneficiaryIdentityGroupAction::class);
    $resolver->shouldReceive('execute')
        ->once()
        ->andReturn(new BeneficiaryIdentityGroup(
            canonical: $beneficiary,
            beneficiaryIds: [$beneficiary->id],
            householdIds: [$context['household_id']],
        ));

    $result = (new CheckElegibilityAction($resolver))->execute(
        beneficiary: $beneficiary,
        type: $type,
        onBehalfDateOfDeath: '2026-08-01',
    );

    expect($result->eligible)->toBeTrue();
});

it('throttles citizen assistance submissions as abuse protection', function () {
    $route = app('router')->getRoutes()->getByName('actionCenter.apply.assistance.store');

    expect($route)->not->toBeNull()
        ->and($route->gatherMiddleware())->toContain('throttle:5,1');
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
    bool $filedForSelf = false,
    ?string $onBehalfDateOfDeath = null,
): StoreAssistanceRequestDto {
    return new StoreAssistanceRequestDto(
        municipalId: $context['municipal_id'],
        municipalCode: '174003000',
        beneficiaryId: $context['beneficiary_id'],
        householdId: $context['household_id'],
        assistanceTypeId: $context['assistance_type_id'],
        submitterUserId: $context['submitter_user_id'],
        encodedByUserId: $encodedByUserId,
        description: 'Medical assistance requested for an adult household member.',
        verificationOverrideReason: $verificationOverrideReason,
        privacyConsentedAt: CarbonImmutable::now(),
        privacyNoticeVersion: 'v1.0',
        relationshipToBeneficiary: $filedForSelf ? null : $relationshipToBeneficiary,
        onBehalfHouseholdMemberId: $filedForSelf ? null : $context['member_id'],
        onBehalfFirstName: $filedForSelf ? null : 'Pedro',
        onBehalfMiddleName: null,
        onBehalfLastName: $filedForSelf ? null : 'Santos',
        onBehalfSuffix: null,
        onBehalfDateOfDeath: $onBehalfDateOfDeath,
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

function snapshotTestSmsNotifier(): AssistanceRequestSmsNotifier
{
    $notifier = Mockery::mock(AssistanceRequestSmsNotifier::class);
    $notifier->shouldReceive('requestReceived')->once();

    return $notifier;
}

function snapshotTestEligibility(): CheckElegibilityAction
{
    $eligibility = Mockery::mock(CheckElegibilityAction::class);
    $eligibility->shouldReceive('execute')
        ->once()
        ->andReturn(EligibilityResult::eligible());

    return $eligibility;
}
