<?php

use App\Core\ActionCenter\Dto\Beneficiary\CreateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\BeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\Exceptions\RegistrationIdentityCheckException;
use App\Core\ActionCenter\Exceptions\WalkInBeneficiaryIdentityDocumentStorageException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\BeneficiarySmsNotifier;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckBeneficiaryRegistrationIdentityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateBeneficiaryProfileAction;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateWalkInBeneficiaryAction;
use App\External\Api\Request\ActionCenter\StoreProfileSetupRequest;
use App\External\Api\Request\ActionCenter\Walkin\StoreWalkInBeneficiaryRequest;
use App\Shared\IdGenerator\Contracts\IdGeneratorInterface;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();
    Storage::fake('public');

    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('municipal_code')->nullable();
    });

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('email')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_beneficiary_sequences', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->unique();
        $table->unsignedInteger('last_seq')->default(0);
        $table->timestamps();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('user_id')->nullable();
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->ulid('merged_into_beneficiary_id')->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->ulid('identity_verified_by_user_id')->nullable();
        $table->timestamp('intake_rejected_at')->nullable();
        $table->ulid('intake_rejected_by_user_id')->nullable();
        $table->string('intake_rejection_reason', 1000)->nullable();
        $table->string('beneficiary_number')->nullable();
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
        $table->timestamp('terms_consented_at')->nullable();
        $table->string('terms_version')->nullable();
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
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('sex')->nullable();
        $table->string('relationship')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->ulid('religion_id')->nullable();
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->ulidMorphs('model');
        $table->uuid()->nullable()->unique();
        $table->string('collection_name');
        $table->string('name');
        $table->string('file_name');
        $table->string('mime_type')->nullable();
        $table->string('disk');
        $table->string('conversions_disk')->nullable();
        $table->unsignedBigInteger('size');
        $table->json('manipulations');
        $table->json('custom_properties');
        $table->json('generated_conversions');
        $table->json('responsive_images');
        $table->unsignedInteger('order_column')->nullable()->index();
        $table->nullableTimestamps();
    });

    $this->municipalId = (string) Str::ulid();
    $this->adminId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        'id' => $this->municipalId,
        'name' => 'Gasan',
        'municipal_code' => '174003',
    ]);

    DB::table('users')->insert([
        'id' => $this->adminId,
        'first_name' => 'Admin',
        'last_name' => 'Reviewer',
        'email' => 'admin@example.test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->app->bind(IdGeneratorInterface::class, fn () => new class implements IdGeneratorInterface
    {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'activity_log',
        'role_has_permissions',
        'model_has_roles',
        'model_has_permissions',
        'roles',
        'permissions',
        'media',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_households',
        'ac_beneficiary_sequences',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('requires ID front only when saving a walk-in as verified', function () {
    $pending = walkInRequest(['verify_now' => false]);
    $verifiedWithoutId = walkInRequest(['verify_now' => true]);
    $verifiedWithId = walkInRequest([
        'verify_now' => true,
        'identity_id_front' => UploadedFile::fake()->image('front.jpg'),
    ]);

    expect(Validator::make($pending->all(), $pending->rules())->passes())->toBeTrue()
        ->and(Validator::make($verifiedWithoutId->all(), $verifiedWithoutId->rules())->errors()->has('identity_id_front'))->toBeTrue()
        ->and(Validator::make($verifiedWithId->all(), $verifiedWithId->rules())->passes())->toBeTrue();
});

it('requires a valid contact phone for portal profile setup', function () {
    $missingPhone = portalProfileRequest(['contact_phone' => '']);
    $validPhone = portalProfileRequest(['contact_phone' => '0917 123 4567']);

    expect(Validator::make($missingPhone->all(), $missingPhone->rules())->errors()->has('contact_phone'))->toBeTrue()
        ->and(Validator::make($validPhone->all(), $validPhone->rules())->passes())->toBeTrue();
});

it('recovers a missing portal front ID on retry without recreating or overwriting the profile', function () {
    $notifier = \Mockery::mock(BeneficiarySmsNotifier::class);
    $notifier->shouldReceive('profileReceived')->once();
    $this->app->instance(BeneficiarySmsNotifier::class, $notifier);

    $failedFront = UploadedFile::fake()->image('front-failed.jpg');
    @unlink($failedFront->getPathname());

    $action = app(CreateBeneficiaryProfileAction::class);

    expect(fn () => $action->execute(portalProfileDto(
        municipalId: $this->municipalId,
        userId: $this->adminId,
        identityIdFront: $failedFront,
    )))->toThrow(
        BeneficiaryIdentityDocumentStorageException::class,
        'profile was saved, but the front ID could not be stored',
    );

    expect(Beneficiary::count())->toBe(1)
        ->and(DB::table('ac_households')->count())->toBe(1)
        ->and(DB::table('ac_household_members')->count())->toBe(1)
        ->and(DB::table('media')->count())->toBe(0);

    $recovered = $action->execute(portalProfileDto(
        municipalId: $this->municipalId,
        userId: $this->adminId,
        identityIdFront: UploadedFile::fake()->image('front-retry.jpg'),
    ));
    $storedFront = $recovered->getFirstMedia('identity_id_front');

    expect($storedFront)->not->toBeNull()
        ->and(Beneficiary::count())->toBe(1)
        ->and(DB::table('ac_households')->count())->toBe(1)
        ->and(DB::table('ac_household_members')->count())->toBe(1)
        ->and(DB::table('media')->count())->toBe(1);

    $returnedAgain = $action->execute(portalProfileDto(
        municipalId: $this->municipalId,
        userId: $this->adminId,
        identityIdFront: UploadedFile::fake()->image('must-not-replace.jpg'),
    ));

    expect($returnedAgain->id)->toBe($recovered->id)
        ->and($returnedAgain->getFirstMedia('identity_id_front')?->id)->toBe($storedFront?->id)
        ->and(DB::table('media')->count())->toBe(1);
});

it('stores normalized walk-in contact phone when provided', function () {
    $beneficiary = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: [
            'contact_phone' => '0917 123 4567',
        ],
    ));

    expect($beneficiary->contact_phone)->toBe('639171234567');
});

it('stores walk-in identity documents on the beneficiary media collections', function () {
    $beneficiary = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        verifyNow: true,
        identityIdFront: UploadedFile::fake()->image('front.jpg'),
        identityIdBack: UploadedFile::fake()->image('back.png'),
        overrides: [
            'household_members' => [
                [
                    'first_name' => 'Pedro',
                    'last_name' => 'Cruz',
                    'relationship' => 'sibling',
                ],
            ],
        ],
    ));

    $dependent = HouseholdMember::query()
        ->where('household_id', $beneficiary->household_id)
        ->where('relationship', 'sibling')
        ->firstOrFail();

    expect($beneficiary->identity_verified_at)->not->toBeNull()
        ->and($beneficiary->identity_verified_by_user_id)->toBe($this->adminId)
        ->and($dependent->is_verified_dependent)->toBeTrue()
        ->and($beneficiary->getFirstMedia('identity_id_front')?->file_name)->toContain('identity-id-front-')
        ->and($beneficiary->getFirstMedia('identity_id_back')?->file_name)->toContain('identity-id-back-');
});

it('retains a failed verified walk-in as pending with pending dependents', function () {
    $failedFront = UploadedFile::fake()->image('front-failed.jpg');
    @unlink($failedFront->getPathname());

    $caught = null;

    try {
        app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
            municipalId: $this->municipalId,
            adminId: $this->adminId,
            verifyNow: true,
            identityIdFront: $failedFront,
            overrides: [
                'household_members' => [
                    [
                        'first_name' => 'Pedro',
                        'last_name' => 'Cruz',
                        'relationship' => 'sibling',
                    ],
                ],
            ],
        ));
    } catch (WalkInBeneficiaryIdentityDocumentStorageException $exception) {
        $caught = $exception;
    }

    $beneficiary = Beneficiary::query()->sole();
    $dependent = HouseholdMember::query()
        ->where('household_id', $beneficiary->household_id)
        ->where('relationship', 'sibling')
        ->firstOrFail();

    expect($caught)->toBeInstanceOf(WalkInBeneficiaryIdentityDocumentStorageException::class)
        ->and($caught?->beneficiaryId())->toBe($beneficiary->id)
        ->and($beneficiary->identity_verified_at)->toBeNull()
        ->and($beneficiary->identity_verified_by_user_id)->toBeNull()
        ->and($dependent->is_verified_dependent)->toBeFalse()
        ->and($beneficiary->hasMedia('identity_id_front'))->toBeFalse();
});

it('requires occupation and monthly income for portal and walk-in beneficiary profiles', function () {
    $walkIn = walkInRequest([
        'occupation' => '',
        'monthly_income' => '',
    ]);
    $portal = portalProfileRequest([
        'occupation' => '',
        'monthly_income' => '',
    ]);

    $walkInValidator = Validator::make($walkIn->all(), $walkIn->rules());
    $portalValidator = Validator::make($portal->all(), $portal->rules());

    expect($walkInValidator->errors()->has('occupation'))->toBeTrue()
        ->and($walkInValidator->errors()->has('monthly_income'))->toBeTrue()
        ->and($portalValidator->errors()->has('occupation'))->toBeTrue()
        ->and($portalValidator->errors()->has('monthly_income'))->toBeTrue()
        ->and(Validator::make(walkInRequest()->all(), walkInRequest()->rules())->passes())->toBeTrue()
        ->and(Validator::make(portalProfileRequest()->all(), portalProfileRequest()->rules())->passes())->toBeTrue();
});

it('requires a registry context and rejects the old force bypass', function () {
    $missingCheck = walkInRequest(['identity_check_context' => null]);
    $forgedForce = walkInRequest(['force' => true]);

    expect(Validator::make($missingCheck->all(), $missingCheck->rules())->errors()->has('identity_check_context'))->toBeTrue()
        ->and(Validator::make($forgedForce->all(), $forgedForce->rules())->errors()->has('force'))->toBeTrue();
});

it('does not store identity documents when the duplicate guard blocks walk-in creation', function () {
    $existing = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));

    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        identityIdFront: UploadedFile::fake()->image('front.jpg'),
    )))->toThrow(RegistrationIdentityCheckException::class);

    expect(Beneficiary::count())->toBe(1)
        ->and($existing->fresh(['media'])->media)->toHaveCount(0)
        ->and(DB::table('media')->count())->toBe(0);
});

it('shows exact and possible matches without leaking records from another municipality', function () {
    $existing = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));
    $otherMunicipalId = (string) Str::ulid();
    DB::table('municipalities')->insert(['id' => $otherMunicipalId, 'name' => 'BOAC']);
    app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $otherMunicipalId,
        adminId: $this->adminId,
    ));

    $check = app(CheckBeneficiaryRegistrationIdentityAction::class);
    $exact = $check->execute(['first_name' => ' juan ', 'last_name' => 'CRUZ', 'birth_date' => '1990-01-01'], $this->municipalId, $this->adminId);
    $possible = $check->execute(['first_name' => 'JUAN', 'last_name' => 'CRUZ', 'birth_date' => '1990-01-02'], $this->municipalId, $this->adminId);
    $formatted = $check->execute(['first_name' => 'Juan.', 'last_name' => 'Cruz-', 'birth_date' => '1990-01-02'], $this->municipalId, $this->adminId);
    $nameVariation = $check->execute(['first_name' => 'JUAN', 'last_name' => 'CRUS', 'birth_date' => '1990-01-01'], $this->municipalId, $this->adminId);

    expect($exact['candidates'])->toHaveCount(1)
        ->and($exact['candidates'][0]['id'])->toBe($existing->id)
        ->and($exact['candidates'][0]['match_type'])->toBe('exact')
        ->and($possible['candidates'])->toHaveCount(1)
        ->and($possible['candidates'][0]['match_type'])->toBe('possible')
        ->and($formatted['candidates'])->toHaveCount(1)
        ->and($nameVariation['candidates'])->toHaveCount(1);
});

it('does not offer direct roster reuse when birth date evidence is missing', function () {
    $existing = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));
    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $existing->household_id,
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
        'relationship' => 'child',
        'birth_date' => null,
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $result = app(CheckBeneficiaryRegistrationIdentityAction::class)->execute([
        'first_name' => 'MARIA',
        'last_name' => 'SANTOS',
        'birth_date' => '2000-06-01',
    ], $this->municipalId, $this->adminId);

    expect($result['candidates'])->toHaveCount(1)
        ->and($result['candidates'][0]['record_type'])->toBe('roster_only')
        ->and($result['candidates'][0]['can_reuse'])->toBeFalse();
});

it('rejects stale checks and changed identity before writing another profile', function () {
    $check = app(CheckBeneficiaryRegistrationIdentityAction::class);
    $identity = ['first_name' => 'JUAN', 'last_name' => 'CRUZ', 'birth_date' => '1990-01-01'];
    $emptyContext = $check->execute($identity, $this->municipalId, $this->adminId)['context'];

    app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: ['identity_check_context' => $emptyContext],
    ));

    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: ['identity_check_context' => $emptyContext],
    )))->toThrow(RegistrationIdentityCheckException::class, 'Registry results changed');

    $currentContext = $check->execute($identity, $this->municipalId, $this->adminId)['context'];
    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: ['last_name' => 'SANTOS', 'identity_check_context' => $currentContext],
    )))->toThrow(RegistrationIdentityCheckException::class, 'identity changed');

    expect(Beneficiary::query()->count())->toBe(1);
});

it('rejects a forged registry context before creating a beneficiary', function () {
    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: ['identity_check_context' => 'forged-context'],
    )))->toThrow(RegistrationIdentityCheckException::class, 'invalid');

    expect(Beneficiary::query()->count())->toBe(0);
});

it('requires correction permission and audits an authorized different-person decision', function () {
    Schema::create('activity_log', function (Blueprint $table) {
        $table->id();
        $table->string('log_name')->nullable();
        $table->text('description');
        $table->nullableUlidMorphs('subject');
        $table->nullableUlidMorphs('causer');
        $table->json('properties')->nullable();
        $table->json('attribute_changes')->nullable();
        $table->string('event')->nullable();
        $table->uuid('batch_uuid')->nullable();
        $table->timestamps();
    });
    Schema::create('permissions', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    Schema::create('roles', function (Blueprint $table) {
        $table->id();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    Schema::create('model_has_permissions', function (Blueprint $table) {
        $table->unsignedBigInteger('permission_id');
        $table->string('model_type');
        $table->ulid('model_id');
    });
    Schema::create('model_has_roles', function (Blueprint $table) {
        $table->unsignedBigInteger('role_id');
        $table->string('model_type');
        $table->ulid('model_id');
    });
    Schema::create('role_has_permissions', function (Blueprint $table) {
        $table->unsignedBigInteger('permission_id');
        $table->unsignedBigInteger('role_id');
    });
    $permissionId = DB::table('permissions')->insertGetId([
        'name' => 'action_center.beneficiaries.correct',
        'guard_name' => 'web',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));
    $reason = 'The government IDs show two different people with the same name and birth date.';
    $dto = walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        overrides: ['different_person_reason' => $reason],
    );

    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute($dto))
        ->toThrow(RegistrationIdentityCheckException::class, 'correction permission');

    DB::table('model_has_permissions')->insert([
        'permission_id' => $permissionId,
        'model_type' => 'user',
        'model_id' => $this->adminId,
    ]);
    app(Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
    activity()->enableLogging();
    $created = app(CreateWalkInBeneficiaryAction::class)->execute($dto);

    expect(Beneficiary::query()->count())->toBe(2)
        ->and(DB::table('activity_log')->where('log_name', 'beneficiary-duplicate-review')->where('subject_id', $created->id)->exists())->toBeTrue();
});

function walkInRequest(array $overrides = []): StoreWalkInBeneficiaryRequest
{
    $files = array_filter([
        'identity_id_front' => $overrides['identity_id_front'] ?? null,
        'identity_id_back' => $overrides['identity_id_back'] ?? null,
    ]);

    unset($overrides['identity_id_front'], $overrides['identity_id_back']);

    $request = StoreWalkInBeneficiaryRequest::create('/api/action-center/walkin', 'POST', array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'none',
        'monthly_income' => '0',
        'barangay' => 'Poblacion',
        'terms_consent' => '1',
        'verify_now' => false,
        'identity_check_context' => 'validated-in-other-tests',
    ], $overrides), [], $files);

    $request->setContainer(app());

    return $request;
}

function portalProfileRequest(array $overrides = []): StoreProfileSetupRequest
{
    $files = array_filter([
        'identity_id_front' => $overrides['identity_id_front'] ?? UploadedFile::fake()->image('front.jpg'),
        'identity_id_back' => $overrides['identity_id_back'] ?? null,
    ]);

    unset($overrides['identity_id_front'], $overrides['identity_id_back']);

    $request = StoreProfileSetupRequest::create('/action-center/profile/setup', 'POST', array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'civil_status' => 'single',
        'occupation' => 'none',
        'monthly_income' => '0',
        'contact_phone' => '09171234567',
        'barangay' => 'Poblacion',
        'terms_consent' => '1',
    ], $overrides), [], $files);

    $request->setContainer(app());

    return $request;
}

function walkInDto(
    string $municipalId,
    string $adminId,
    bool $verifyNow = false,
    ?UploadedFile $identityIdFront = null,
    ?UploadedFile $identityIdBack = null,
    array $overrides = [],
): CreateWalkInBeneficiaryDto {
    $data = array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'none',
        'monthly_income' => '0',
        'barangay' => 'Poblacion',
        'street' => 'Rizal',
        'terms_consent' => true,
        'verify_now' => $verifyNow,
        'household_members' => [],
    ], $overrides);
    $data['identity_check_context'] ??= app(CheckBeneficiaryRegistrationIdentityAction::class)->execute($data, $municipalId, $adminId)['context'];

    return CreateWalkInBeneficiaryDto::fromArray($data, $adminId, $municipalId, $identityIdFront, $identityIdBack);
}

function portalProfileDto(
    string $municipalId,
    string $userId,
    UploadedFile $identityIdFront,
    ?UploadedFile $identityIdBack = null,
): CreateBeneficiaryProfileDto {
    return CreateBeneficiaryProfileDto::fromArray([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'sex' => 'female',
        'birth_date' => '1992-04-10',
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'none',
        'monthly_income' => '0',
        'contact_phone' => '09171234567',
        'barangay' => 'Poblacion',
        'street' => 'Rizal',
        'terms_consent' => true,
        'household_members' => [],
    ], $userId, $municipalId, $identityIdFront, $identityIdBack);
}
