<?php

use App\Core\ActionCenter\Dto\Beneficiary\ReviewBeneficiaryIntakeDto;
use App\Core\ActionCenter\Dto\Beneficiary\UpdateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Dto\Household\UpdateHouseholdMemberDto;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ReviewBeneficiaryIntakeAction;
use App\Core\ActionCenter\UseCase\Beneficiary\UpdateBeneficiaryProfileAction;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\Core\ActionCenter\UseCase\Household\UpdateHouseholdMemberAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
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

    Schema::create('ac_beneficiaries', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('user_id')->nullable();
        $table->ulid('municipal_id');
        $table->boolean('is_active')->default(true);
        $table->ulid('merged_into_beneficiary_id')->nullable();
        $table->timestamp('identity_verified_at')->nullable();
        $table->ulid('identity_verified_by_user_id')->nullable();
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
        $table->softDeletes();
        $table->timestamps();
    });

    $this->municipalId = (string) Str::ulid();
    $this->adminId = (string) Str::ulid();

    DB::table('municipalities')->insert(['id' => $this->municipalId]);
    DB::table('users')->insert([
        'id' => $this->adminId,
        'first_name' => 'Admin',
        'last_name' => 'Reviewer',
        'email' => 'admin@example.test',
        'password' => 'test',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    activity()->disableLogging();
});

afterEach(function () {
    activity()->enableLogging();
    Schema::dropIfExists('ac_household_members');
    Schema::dropIfExists('ac_beneficiaries');
    Schema::dropIfExists('ac_households');
    Schema::dropIfExists('users');
    Schema::dropIfExists('municipalities');
});

it('adds nullable claimant verification and an unverified dependent default', function () {
    [$beneficiary, $head] = createClaimant($this->municipalId, 'JUAN', 'CRUZ');

    $dependent = HouseholdMember::create([
        'household_id' => $beneficiary->household_id,
        'first_name' => 'PEDRO',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
        'is_active' => true,
    ]);

    expect($beneficiary->identity_verified_at)->toBeNull()
        ->and($beneficiary->identity_verified_by_user_id)->toBeNull()
        ->and($head->fresh()->is_verified_dependent)->toBeFalse()
        ->and($dependent->fresh()->is_verified_dependent)->toBeFalse();
});

it('reviews a provisional household and verifies accepted dependents', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ');
    $accepted = createDependent($beneficiary->household_id, 'PEDRO', 'CRUZ');
    $rejected = createDependent($beneficiary->household_id, 'UNKNOWN', 'PERSON');

    app(ReviewBeneficiaryIntakeAction::class)->execute(new ReviewBeneficiaryIntakeDto(
        beneficiaryId: $beneficiary->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        householdResolution: 'keep_existing',
        targetMemberId: null,
        verifiedMemberIds: [$accepted->id],
        rejectedMemberIds: [$rejected->id],
    ));

    expect($beneficiary->fresh()->identity_verified_at)->not->toBeNull()
        ->and($beneficiary->fresh()->identity_verified_by_user_id)->toBe($this->adminId)
        ->and($accepted->fresh()->is_verified_dependent)->toBeTrue()
        ->and(HouseholdMember::withTrashed()->find($rejected->id)->trashed())->toBeTrue();

    expect(fn () => app(ReviewBeneficiaryIntakeAction::class)->execute(new ReviewBeneficiaryIntakeDto(
        beneficiaryId: $beneficiary->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        householdResolution: 'keep_existing',
        targetMemberId: null,
        verifiedMemberIds: [$accepted->id],
        rejectedMemberIds: [],
    )))->toThrow(DomainException::class, 'already been verified');
});

it('joins a verified household through an exact member match and retires the provisional household', function () {
    [$juan, $juanHead] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    $pedroMatch = createDependent($juan->household_id, 'PEDRO', 'CRUZ', '1992-04-10', true);

    [$pedro] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ', '1992-04-10');
    $sourceHouseholdId = $pedro->household_id;
    $child = createDependent($sourceHouseholdId, 'ANA', 'CRUZ', '2015-01-01');

    app(ReviewBeneficiaryIntakeAction::class)->execute(new ReviewBeneficiaryIntakeDto(
        beneficiaryId: $pedro->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        householdResolution: 'join_existing',
        targetMemberId: $pedroMatch->id,
        verifiedMemberIds: [$child->id],
        rejectedMemberIds: [],
    ));

    expect($pedro->fresh()->household_id)->toBe($juan->household_id)
        ->and($pedroMatch->fresh()->beneficiary_id)->toBe($pedro->id)
        ->and($pedroMatch->fresh()->is_verified_dependent)->toBeTrue()
        ->and($child->fresh()->household_id)->toBe($juan->household_id)
        ->and(Household::withTrashed()->find($sourceHouseholdId)->trashed())->toBeTrue()
        ->and($juanHead->fresh()->beneficiary_id)->toBe($juan->id);
});

it('excludes unverified dependents from the authoritative roster scope', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    createDependent($beneficiary->household_id, 'VERIFIED', 'CHILD', verified: true);
    createDependent($beneficiary->household_id, 'PENDING', 'CHILD');

    $names = HouseholdMember::query()
        ->where('household_id', $beneficiary->household_id)
        ->authoritative()
        ->pluck('first_name')
        ->all();

    expect($names)->toContain('JUAN', 'VERIFIED')
        ->not->toContain('PENDING');
});

it('blocks an unverified claimant and an unverified selected dependent', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ');
    $type = new AssistanceType(['name' => 'Medical']);
    $type->id = (string) Str::ulid();

    $eligibility = new CheckElegibilityAction(new ResolveBeneficiaryIdentityGroupAction);

    expect($eligibility->execute($beneficiary, $type)->reason)->toBe('identity_unverified');

    $beneficiary->update([
        'identity_verified_at' => now(),
        'identity_verified_by_user_id' => $this->adminId,
    ]);
    $dependent = createDependent($beneficiary->household_id, 'PEDRO', 'CRUZ');

    expect($eligibility->execute($beneficiary->fresh(), $type, $dependent->id)->reason)
        ->toBe('dependent_unverified');
});

it('resets claimant and dependent verification after material identity edits', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);

    app(UpdateBeneficiaryProfileAction::class)->execute(new UpdateBeneficiaryProfileDto(
        beneficiaryId: $beneficiary->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        firstName: 'JUANITO',
        lastName: 'CRUZ',
        middleName: null,
        suffix: null,
        sex: 'male',
        birthDate: '1990-01-01',
        religionId: null,
        educationalAttainment: null,
        civilStatus: 'single',
        occupation: 'FARMER',
        monthlyIncome: 5000,
    ));

    $beneficiary->refresh();
    $primaryRow = HouseholdMember::query()
        ->where('household_id', $beneficiary->household_id)
        ->where('beneficiary_id', $beneficiary->id)
        ->firstOrFail();

    expect($beneficiary->identity_verified_at)->toBeNull()
        ->and($beneficiary->identity_verified_by_user_id)->toBeNull()
        ->and($primaryRow->first_name)->toBe('JUANITO');
});

it('revokes dependent verification on material edits and preserves it on non-material edits', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    $member = createDependent($beneficiary->household_id, 'PEDRO', 'CRUZ', verified: true);
    $action = app(UpdateHouseholdMemberAction::class);

    $action->execute(UpdateHouseholdMemberDto::fromArray([
        'first_name' => 'PEDRITO',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
        'birth_date' => '1992-04-10',
        'monthly_income' => 0,
        'is_verified_dependent' => true,
    ], $member->id, $this->municipalId));

    expect($member->fresh()->is_verified_dependent)->toBeFalse();

    $member->refresh()->update(['is_verified_dependent' => true]);

    $action->execute(UpdateHouseholdMemberDto::fromArray([
        'first_name' => 'PEDRITO',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
        'birth_date' => '1992-04-10',
        'monthly_income' => 2500,
        'is_verified_dependent' => false,
    ], $member->id, $this->municipalId));

    expect($member->fresh()->is_verified_dependent)->toBeTrue();
});

it('lets direct admin member creation choose pending or verified', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ');
    $action = app(StoreHouseholdMemberAction::class);
    $dto = StoreHouseholdMemberDto::fromArray([
        'first_name' => 'PEDRO',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
    ], $beneficiary->household_id);

    $pending = $action->execute($dto);
    $verified = $action->execute(StoreHouseholdMemberDto::fromArray([
        'first_name' => 'ANA',
        'last_name' => 'CRUZ',
        'relationship' => 'child',
    ], $beneficiary->household_id), isVerifiedDependent: true);

    expect($pending->is_verified_dependent)->toBeFalse()
        ->and($verified->is_verified_dependent)->toBeTrue();
});

function createClaimant(
    string $municipalId,
    string $firstName,
    string $lastName,
    string $birthDate = '1990-01-01',
    ?string $verifiedBy = null,
): array {
    $household = Household::create([
        'municipal_id' => $municipalId,
        'barangay' => 'POBLACION',
        'street' => 'RIZAL',
    ]);

    $beneficiary = Beneficiary::create([
        'household_id' => $household->id,
        'municipal_id' => $municipalId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'sex' => 'male',
        'birth_date' => $birthDate,
        'civil_status' => 'single',
        'occupation' => 'NONE',
        'monthly_income' => 0,
        'terms_consented_at' => now(),
        'terms_version' => 'v1.0',
        'identity_verified_at' => $verifiedBy ? now() : null,
        'identity_verified_by_user_id' => $verifiedBy,
    ]);

    $head = HouseholdMember::create([
        'household_id' => $household->id,
        'beneficiary_id' => $beneficiary->id,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'birth_date' => $birthDate,
        'sex' => 'male',
        'relationship' => 'head',
        'is_active' => true,
    ]);

    return [$beneficiary, $head];
}

function createDependent(
    string $householdId,
    string $firstName,
    string $lastName,
    string $birthDate = '1992-04-10',
    bool $verified = false,
): HouseholdMember {
    return HouseholdMember::create([
        'household_id' => $householdId,
        'first_name' => $firstName,
        'last_name' => $lastName,
        'birth_date' => $birthDate,
        'relationship' => 'sibling',
        'is_active' => true,
        'is_verified_dependent' => $verified,
    ]);
}
