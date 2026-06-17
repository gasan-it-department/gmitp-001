<?php

use App\Core\ActionCenter\Dto\Beneficiary\ResubmitBeneficiaryProfileCorrectionDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ResubmitBeneficiaryProfileCorrectionAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();
    Storage::fake('public');

    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name')->nullable();
        $table->string('municipal_code')->nullable();
    });

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('email')->nullable();
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
    $this->userId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        'id' => $this->municipalId,
        'name' => 'Gasan',
        'municipal_code' => '174003',
    ]);

    DB::table('users')->insert([
        'id' => $this->userId,
        'first_name' => 'Portal',
        'last_name' => 'Citizen',
        'email' => 'citizen@example.test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    activity()->enableLogging();

    foreach ([
        'media',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_households',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('resubmits a rejected profile and returns it to pending review', function () {
    [$beneficiary, $head] = rejectedPortalBeneficiary($this->municipalId, $this->userId);
    $oldProvisional = householdMember($beneficiary->household_id, 'OLD', 'ENTRY');
    $verifiedDependent = householdMember($beneficiary->household_id, 'VERIFIED', 'CHILD', verified: true);

    $result = app(ResubmitBeneficiaryProfileCorrectionAction::class)->execute(correctionDto(
        userId: $this->userId,
        municipalId: $this->municipalId,
        overrides: [
            'first_name' => 'Juanito',
            'barangay' => 'Bangbang',
            'barangay_code' => '174003001',
            'street' => 'New Street',
            'household_members' => [[
                'first_name' => 'Pedro',
                'last_name' => 'Cruz',
                'relationship' => 'sibling',
                'birth_date' => '1992-04-10',
                'sex' => 'male',
                'civil_status' => 'single',
                'occupation' => 'none',
                'monthly_income' => '0',
            ]],
        ],
    ));

    expect($result->id)->toBe($beneficiary->id)
        ->and($result->household_id)->toBe($beneficiary->household_id)
        ->and($result->first_name)->toBe('JUANITO')
        ->and($result->intakeStatus())->toBe('pending')
        ->and($result->intake_rejected_at)->toBeNull()
        ->and($result->intake_rejected_by_user_id)->toBeNull()
        ->and($result->intake_rejection_reason)->toBeNull()
        ->and($result->identity_verified_at)->toBeNull();

    expect($result->household->barangay)->toBe('BANGBANG')
        ->and($result->household->barangay_psgc_code)->toBe('174003001')
        ->and($result->household->street)->toBe('NEW STREET')
        ->and($head->fresh()->first_name)->toBe('JUANITO')
        ->and(HouseholdMember::withTrashed()->find($oldProvisional->id)->trashed())->toBeTrue()
        ->and($verifiedDependent->fresh()->trashed())->toBeFalse();

    $newMember = HouseholdMember::query()
        ->where('household_id', $beneficiary->household_id)
        ->where('first_name', 'PEDRO')
        ->firstOrFail();

    expect($newMember->is_verified_dependent)->toBeFalse()
        ->and($newMember->beneficiary_id)->toBeNull();
});

it('blocks correction unless the portal profile is rejected', function () {
    [$pending] = rejectedPortalBeneficiary($this->municipalId, $this->userId);
    $pending->update([
        'intake_rejected_at' => null,
        'intake_rejected_by_user_id' => null,
        'intake_rejection_reason' => null,
    ]);

    expect(fn () => app(ResubmitBeneficiaryProfileCorrectionAction::class)->execute(correctionDto(
        userId: $this->userId,
        municipalId: $this->municipalId,
    )))->toThrow(DomainException::class, 'Only rejected');

    $pending->update([
        'identity_verified_at' => now(),
        'identity_verified_by_user_id' => $this->userId,
    ]);

    expect(fn () => app(ResubmitBeneficiaryProfileCorrectionAction::class)->execute(correctionDto(
        userId: $this->userId,
        municipalId: $this->municipalId,
    )))->toThrow(DomainException::class, 'already been verified');
});

it('replaces uploaded identity documents on correction', function () {
    [$beneficiary] = rejectedPortalBeneficiary($this->municipalId, $this->userId);

    $beneficiary
        ->addMedia(UploadedFile::fake()->image('old-front.jpg'))
        ->toMediaCollection('identity_id_front');

    $result = app(ResubmitBeneficiaryProfileCorrectionAction::class)->execute(correctionDto(
        userId: $this->userId,
        municipalId: $this->municipalId,
        identityIdFront: UploadedFile::fake()->image('new-front.jpg'),
        identityIdBack: UploadedFile::fake()->image('new-back.png'),
    ));

    expect($result->getMedia('identity_id_front'))->toHaveCount(1)
        ->and($result->getFirstMedia('identity_id_front')?->file_name)->toContain('identity-id-front-')
        ->and($result->getFirstMedia('identity_id_front')?->file_name)->toContain('.jpg')
        ->and($result->getMedia('identity_id_back'))->toHaveCount(1)
        ->and($result->getFirstMedia('identity_id_back')?->file_name)->toContain('identity-id-back-');
});

function rejectedPortalBeneficiary(string $municipalId, string $userId): array
{
    $household = Household::create([
        'municipal_id' => $municipalId,
        'barangay' => 'POBLACION',
        'barangay_psgc_code' => '174003000',
        'street' => 'RIZAL',
    ]);

    $beneficiary = Beneficiary::create([
        'household_id' => $household->id,
        'user_id' => $userId,
        'municipal_id' => $municipalId,
        'first_name' => 'JUAN',
        'last_name' => 'CRUZ',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'NONE',
        'monthly_income' => 0,
        'terms_consented_at' => now(),
        'terms_version' => 'v1.0',
        'intake_rejected_at' => now(),
        'intake_rejected_by_user_id' => $userId,
        'intake_rejection_reason' => 'The uploaded ID was unclear.',
    ]);

    $head = HouseholdMember::create([
        'household_id' => $household->id,
        'beneficiary_id' => $beneficiary->id,
        'first_name' => 'JUAN',
        'last_name' => 'CRUZ',
        'birth_date' => '1990-01-01',
        'sex' => 'male',
        'relationship' => 'head',
        'civil_status' => 'single',
        'occupation' => 'NONE',
        'monthly_income' => 0,
        'is_active' => true,
    ]);

    return [$beneficiary, $head];
}

function householdMember(
    string $householdId,
    string $firstName,
    string $lastName,
    bool $verified = false,
): HouseholdMember {
    return HouseholdMember::create([
        'household_id' => $householdId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'relationship' => 'sibling',
        'birth_date' => '1992-04-10',
        'is_active' => true,
        'is_verified_dependent' => $verified,
    ]);
}

function correctionDto(
    string $userId,
    string $municipalId,
    array $overrides = [],
    ?UploadedFile $identityIdFront = null,
    ?UploadedFile $identityIdBack = null,
): ResubmitBeneficiaryProfileCorrectionDto {
    return ResubmitBeneficiaryProfileCorrectionDto::fromArray(array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'middle_name' => null,
        'suffix' => null,
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'religion_id' => null,
        'educational_attainment' => 'hs_grad',
        'civil_status' => 'single',
        'occupation' => 'none',
        'monthly_income' => '0',
        'barangay' => 'Poblacion',
        'barangay_code' => '174003000',
        'street' => 'Rizal',
        'household_members' => [],
    ], $overrides), $userId, $municipalId, $identityIdFront, $identityIdBack);
}
