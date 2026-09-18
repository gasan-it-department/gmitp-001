<?php

use App\Core\ActionCenter\Dto\Beneficiary\CreateHouseholdBeneficiaryDto;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateBeneficiaryInHouseholdAction;
use Carbon\CarbonImmutable;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
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
        $table->string('password')->nullable();
        $table->timestamps();
    });
    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay');
        $table->string('barangay_psgc_code')->nullable();
        $table->string('street')->nullable();
        $table->softDeletes();
        $table->timestamps();
    });
    Schema::create('ac_beneficiary_sequences', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->unique();
        $table->unsignedBigInteger('last_seq');
        $table->timestamps();
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
        $table->timestamp('terms_consented_at');
        $table->string('terms_version');
        $table->softDeletes();
        $table->timestamps();
    });
    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('relationship');
        $table->date('birth_date')->nullable();
        $table->string('sex')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->ulid('religion_id')->nullable();
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->softDeletes();
        $table->timestamps();
    });
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
    Schema::create('media', function (Blueprint $table) {
        $table->id();
        $table->string('model_type');
        $table->ulid('model_id');
        $table->uuid()->nullable();
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
        $table->unsignedInteger('order_column')->nullable();
        $table->nullableTimestamps();
    });

    $this->municipalId = (string) Str::ulid();
    $this->adminId = (string) Str::ulid();
    $this->householdId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        'id' => $this->municipalId,
        'name' => 'GASAN',
        'municipal_code' => '1704003000',
    ]);
    DB::table('users')->insert([
        'id' => $this->adminId,
        'first_name' => 'ADMIN',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    DB::table('ac_households')->insert([
        'id' => $this->householdId,
        'municipal_id' => $this->municipalId,
        'household_code' => 'HH-GAS-0001',
        'barangay' => 'BANGBANG',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
});

afterEach(function () {
    foreach ([
        'media',
        'activity_log',
        'ac_household_members',
        'ac_beneficiaries',
        'ac_beneficiary_sequences',
        'ac_households',
        'users',
        'municipalities',
    ] as $table) {
        Schema::dropIfExists($table);
    }
});

it('registers a beneficiary directly into an existing household without creating another household', function () {
    $beneficiary = app(CreateBeneficiaryInHouseholdAction::class)->execute(householdBeneficiaryDto(
        householdId: $this->householdId,
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));

    expect(DB::table('ac_households')->count())->toBe(1)
        ->and($beneficiary->household_id)->toBe($this->householdId);

    $this->assertDatabaseHas('ac_household_members', [
        'household_id' => $this->householdId,
        'beneficiary_id' => $beneficiary->id,
        'relationship' => Relationship::Sibling->value,
        'is_active' => true,
        'is_verified_dependent' => false,
    ]);
});

it('reuses one exact active unlinked roster row and preserves its relationship', function () {
    $memberId = (string) Str::ulid();
    DB::table('ac_household_members')->insert([
        'id' => $memberId,
        'household_id' => $this->householdId,
        'beneficiary_id' => null,
        'first_name' => 'JUAN',
        'middle_name' => 'SANTOS',
        'last_name' => 'DELA CRUZ',
        'relationship' => Relationship::Child->value,
        'birth_date' => '1990-02-03',
        'monthly_income' => 0,
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $beneficiary = app(CreateBeneficiaryInHouseholdAction::class)->execute(householdBeneficiaryDto(
        householdId: $this->householdId,
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    ));

    expect(DB::table('ac_household_members')->count())->toBe(1);
    $this->assertDatabaseHas('ac_household_members', [
        'id' => $memberId,
        'beneficiary_id' => $beneficiary->id,
        'relationship' => Relationship::Child->value,
        'is_verified_dependent' => false,
    ]);
});

it('blocks ambiguous matching roster rows before creating the beneficiary', function () {
    foreach ([Relationship::Child, Relationship::Sibling] as $relationship) {
        DB::table('ac_household_members')->insert([
            'id' => (string) Str::ulid(),
            'household_id' => $this->householdId,
            'beneficiary_id' => null,
            'first_name' => 'JUAN',
            'middle_name' => 'SANTOS',
            'last_name' => 'DELA CRUZ',
            'relationship' => $relationship->value,
            'birth_date' => '1990-02-03',
            'monthly_income' => 0,
            'is_active' => true,
            'is_verified_dependent' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    expect(fn () => app(CreateBeneficiaryInHouseholdAction::class)->execute(householdBeneficiaryDto(
        householdId: $this->householdId,
        municipalId: $this->municipalId,
        adminId: $this->adminId,
    )))->toThrow(DomainException::class, 'Multiple active unlinked household rows match this person');

    expect(DB::table('ac_beneficiaries')->count())->toBe(0);
});

it('rejects a destination household owned by another municipality', function () {
    $otherMunicipalId = (string) Str::ulid();
    DB::table('municipalities')->insert([
        'id' => $otherMunicipalId,
        'name' => 'BOAC',
        'municipal_code' => '1704001000',
    ]);

    expect(fn () => app(CreateBeneficiaryInHouseholdAction::class)->execute(householdBeneficiaryDto(
        householdId: $this->householdId,
        municipalId: $otherMunicipalId,
        adminId: $this->adminId,
    )))->toThrow(Illuminate\Database\Eloquent\ModelNotFoundException::class);

    expect(DB::table('ac_beneficiaries')->count())->toBe(0);
});

function householdBeneficiaryDto(string $householdId, string $municipalId, string $adminId): CreateHouseholdBeneficiaryDto
{
    return new CreateHouseholdBeneficiaryDto(
        householdId: $householdId,
        municipalId: $municipalId,
        encodedByUserId: $adminId,
        firstName: 'JUAN',
        lastName: 'DELA CRUZ',
        middleName: 'SANTOS',
        suffix: null,
        sex: 'male',
        birthDate: '1990-02-03',
        religionId: null,
        educationalAttainment: null,
        civilStatus: 'single',
        occupation: 'FARMER',
        monthlyIncome: 3500,
        contactPhone: null,
        relationship: Relationship::Sibling->value,
        termsConsentedAt: CarbonImmutable::now(),
        termsVersion: CreateHouseholdBeneficiaryDto::TERMS_VERSION,
        force: false,
        verifyNow: false,
        identityIdFront: null,
        identityIdBack: null,
    );
}
