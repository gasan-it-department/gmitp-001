<?php

use App\Core\ActionCenter\Dto\Beneficiary\CreateWalkInBeneficiaryDto;
use App\Core\ActionCenter\Exceptions\PotentialDuplicateBeneficiaryException;
use App\Core\ActionCenter\Models\Beneficiary;
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

    $this->app->bind(IdGeneratorInterface::class, fn () => new class implements IdGeneratorInterface {
        public function generate(): string
        {
            return (string) Str::ulid();
        }
    });
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
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
    ));

    expect($beneficiary->identity_verified_at)->not->toBeNull()
        ->and($beneficiary->identity_verified_by_user_id)->toBe($this->adminId)
        ->and($beneficiary->getFirstMedia('identity_id_front')?->file_name)->toContain('identity-id-front-')
        ->and($beneficiary->getFirstMedia('identity_id_back')?->file_name)->toContain('identity-id-back-');
});

it('does not store identity documents when the duplicate guard blocks walk-in creation', function () {
    $existing = app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        force: true,
    ));

    expect(fn () => app(CreateWalkInBeneficiaryAction::class)->execute(walkInDto(
        municipalId: $this->municipalId,
        adminId: $this->adminId,
        identityIdFront: UploadedFile::fake()->image('front.jpg'),
    )))->toThrow(PotentialDuplicateBeneficiaryException::class);

    expect(Beneficiary::count())->toBe(1)
        ->and($existing->fresh(['media'])->media)->toHaveCount(0)
        ->and(DB::table('media')->count())->toBe(0);
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
    bool $force = false,
    ?UploadedFile $identityIdFront = null,
    ?UploadedFile $identityIdBack = null,
    array $overrides = [],
): CreateWalkInBeneficiaryDto {
    return CreateWalkInBeneficiaryDto::fromArray(array_merge([
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
        'force' => $force,
        'household_members' => [],
    ], $overrides), $adminId, $municipalId, $identityIdFront, $identityIdBack);
}
