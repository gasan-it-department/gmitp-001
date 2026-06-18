<?php

use App\Core\ActionCenter\Dto\Beneficiary\ReassignBeneficiaryHouseholdDto;
use App\Core\ActionCenter\Enums\HouseholdReassignmentOperation;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\ReassignBeneficiaryHouseholdAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

beforeEach(function () {
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
        $table->string('contact_phone', 20)->nullable();
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

    $this->municipalId = (string) Str::ulid();
    $this->adminId = (string) Str::ulid();

    DB::table('municipalities')->insert([
        'id' => $this->municipalId,
        'name' => 'GASAN',
        'municipal_code' => '1704003000'
    ]);
    DB::table('users')->insert(['id' => $this->adminId, 'first_name' => 'Admin']);

    // Setup source household
    $this->sourceHouseholdId = (string) Str::ulid();
    DB::table('ac_households')->insert([
        'id' => $this->sourceHouseholdId,
        'municipal_id' => $this->municipalId,
        'barangay' => 'Source Barangay',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Setup source beneficiary
    $this->beneficiaryId = (string) Str::ulid();
    DB::table('ac_beneficiaries')->insert([
        'id' => $this->beneficiaryId,
        'household_id' => $this->sourceHouseholdId,
        'municipal_id' => $this->municipalId,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'birth_date' => '1990-01-01',
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Setup source member row
    $this->sourceMemberId = (string) Str::ulid();
    DB::table('ac_household_members')->insert([
        'id' => $this->sourceMemberId,
        'household_id' => $this->sourceHouseholdId,
        'beneficiary_id' => $this->beneficiaryId,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'relationship' => Relationship::Sibling->value,
        'is_active' => true,
        'is_verified_dependent' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    // Setup destination household
    $this->destHouseholdId = (string) Str::ulid();
    DB::table('ac_households')->insert([
        'id' => $this->destHouseholdId,
        'municipal_id' => $this->municipalId,
        'barangay' => 'Dest Barangay',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $this->destHouseholdId,
        'first_name' => 'Dest',
        'last_name' => 'Head',
        'relationship' => Relationship::Head->value,
        'is_active' => true,
        'is_verified_dependent' => false,
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->action = app(ReassignBeneficiaryHouseholdAction::class);
});

test('correct accidental household join', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Correction,
        reason: 'Accidental join',
        destinationHouseholdId: $this->destHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: true,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_beneficiaries', [
        'id' => $this->beneficiaryId,
        'household_id' => $this->destHouseholdId,
    ]);

    $this->assertDatabaseHas('ac_household_members', [
        'id' => $this->sourceMemberId,
        'is_active' => false,
    ]);

    $this->assertDatabaseHas('ac_household_members', [
        'household_id' => $this->destHouseholdId,
        'beneficiary_id' => $this->beneficiaryId,
        'is_active' => true,
        'is_verified_dependent' => true,
    ]);
});

test('transfer legitimate member', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Transfer,
        reason: 'Moved to another city',
        destinationHouseholdId: $this->destHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_beneficiaries', [
        'id' => $this->beneficiaryId,
        'household_id' => $this->destHouseholdId,
    ]);
});

test('move beneficiary out', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::MoveOut,
        reason: 'Left without new household',
        destinationHouseholdId: null,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_beneficiaries', [
        'id' => $this->beneficiaryId,
        'household_id' => $this->sourceHouseholdId,
    ]);

    $this->assertDatabaseHas('ac_household_members', [
        'id' => $this->sourceMemberId,
        'is_active' => false,
    ]);
});

test('reject cross-municipality', function () {
    $otherMunId = (string) Str::ulid();
    DB::table('municipalities')->insert(['id' => $otherMunId]);

    $otherHouseholdId = (string) Str::ulid();
    DB::table('ac_households')->insert([
        'id' => $otherHouseholdId,
        'municipal_id' => $otherMunId,
        'barangay' => 'Other',
    ]);

    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Transfer,
        reason: 'Transfer',
        destinationHouseholdId: $otherHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('The destination household must be in the same municipality.');

    $this->action->execute($dto);
});

test('reject duplicate active membership', function () {
    DB::table('ac_household_members')->insert([
        'id' => (string) Str::ulid(),
        'household_id' => $this->destHouseholdId,
        'beneficiary_id' => $this->beneficiaryId,
        'first_name' => 'John',
        'last_name' => 'Doe',
        'relationship' => Relationship::Sibling->value,
        'is_active' => true,
    ]);

    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Transfer,
        reason: 'Transfer',
        destinationHouseholdId: $this->destHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('The beneficiary is already active in the destination household.');

    $this->action->execute($dto);
});

test('dependent verification resets', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Correction,
        reason: 'Correction',
        destinationHouseholdId: $this->destHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_household_members', [
        'household_id' => $this->destHouseholdId,
        'beneficiary_id' => $this->beneficiaryId,
        'is_verified_dependent' => false,
    ]);
});

test('activity log properties', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Correction,
        reason: 'Correction detail',
        destinationHouseholdId: $this->destHouseholdId,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: true,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $log = DB::table('activity_log')->where('log_name', 'household-reassignment')->first();
    expect($log)->not->toBeNull();

    $props = json_decode($log->properties, true);
    expect($props['operation'])->toBe('correction')
        ->and($props['reason'])->toBe('Correction detail')
        ->and($props['previous_household_id'])->toBe($this->sourceHouseholdId)
        ->and($props['new_household_id'])->toBe($this->destHouseholdId)
        ->and($props['verification_before'])->toBeTrue()
        ->and($props['verification_after'])->toBeTrue();
});

test('head protection on move-out', function () {
    DB::table('ac_household_members')->where('id', $this->sourceMemberId)->update([
        'relationship' => Relationship::Head->value,
    ]);

    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::MoveOut,
        reason: 'Left',
        destinationHouseholdId: null,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->expectException(\DomainException::class);
    $this->expectExceptionMessage('You must appoint a new head or place the household on hold.');

    $this->action->execute($dto);
});

test('head protection on move-out with successor', function () {
    DB::table('ac_household_members')->where('id', $this->sourceMemberId)->update([
        'relationship' => Relationship::Head->value,
    ]);

    $successorId = (string) Str::ulid();
    $successorBenId = (string) Str::ulid();

    DB::table('ac_beneficiaries')->insert([
        'id' => $successorBenId,
        'household_id' => $this->sourceHouseholdId,
        'municipal_id' => $this->municipalId,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'birth_date' => '1995-01-01',
        'is_active' => true,
        'identity_verified_at' => now(), // Required for eligibility
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    DB::table('ac_household_members')->insert([
        'id' => $successorId,
        'household_id' => $this->sourceHouseholdId,
        'beneficiary_id' => $successorBenId,
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'relationship' => Relationship::Spouse->value,
        'is_active' => true,
        'is_verified_dependent' => true, // Required for eligibility
        'birth_date' => '1995-01-01',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::MoveOut,
        reason: 'Left',
        destinationHouseholdId: null,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: $successorId,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_household_members', [
        'id' => $successorId,
        'relationship' => Relationship::Head->value,
        'is_verified_dependent' => false,
    ]);

    $this->assertDatabaseHas('ac_household_members', [
        'id' => $this->sourceMemberId,
        'is_active' => false,
    ]);
});

test('head protection on move-out with hold', function () {
    DB::table('ac_household_members')->where('id', $this->sourceMemberId)->update([
        'relationship' => Relationship::Head->value,
    ]);

    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::MoveOut,
        reason: 'Left',
        destinationHouseholdId: null,
        destinationMemberId: null,
        newHouseholdBarangay: null,
        newHouseholdStreet: null,
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: true,
    );

    $this->action->execute($dto);

    $this->assertDatabaseHas('ac_household_members', [
        'id' => $this->sourceMemberId,
        'is_active' => false,
    ]);

    $headExists = DB::table('ac_household_members')
        ->where('household_id', $this->sourceHouseholdId)
        ->where('relationship', Relationship::Head->value)
        ->where('is_active', true)
        ->exists();

    expect($headExists)->toBeFalse();
});

test('create provisional household', function () {
    $dto = new ReassignBeneficiaryHouseholdDto(
        beneficiaryId: $this->beneficiaryId,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        operation: HouseholdReassignmentOperation::Transfer,
        reason: 'Transfer to new house',
        destinationHouseholdId: null,
        destinationMemberId: null,
        newHouseholdBarangay: 'New Barangay 123',
        newHouseholdStreet: 'New Street 456',
        verifyAtDestination: false,
        successorMemberId: null,
        placeHouseholdOnHold: false,
    );

    $this->action->execute($dto);

    $newHousehold = DB::table('ac_households')
        ->where('barangay', 'New Barangay 123')
        ->first();

    expect($newHousehold)->not->toBeNull()
        ->and($newHousehold->street)->toBe('New Street 456');

    $this->assertDatabaseHas('ac_beneficiaries', [
        'id' => $this->beneficiaryId,
        'household_id' => $newHousehold->id,
    ]);
});
