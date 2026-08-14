<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\SearchBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Beneficiary\SearchBeneficiaryRequest;
use App\External\Api\Resources\ActionCenter\PeopleSearchResultResource;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('email')->nullable();
        $table->string('phone')->nullable();
        $table->timestamps();
    });

    Schema::create('ac_households', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id');
        $table->string('household_code')->nullable();
        $table->string('barangay')->nullable();
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
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
        $table->ulid('religion_id')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->string('contact_phone')->nullable();
        $table->timestamp('terms_consented_at')->nullable();
        $table->string('terms_version')->nullable();
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_household_members', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('household_id');
        $table->ulid('beneficiary_id')->nullable();
        $table->ulid('religion_id')->nullable();
        $table->string('first_name');
        $table->string('middle_name')->nullable();
        $table->string('last_name');
        $table->string('suffix')->nullable();
        $table->date('birth_date')->nullable();
        $table->string('educational_attainment')->nullable();
        $table->string('sex')->nullable();
        $table->string('relationship')->nullable();
        $table->string('civil_status')->nullable();
        $table->string('occupation')->nullable();
        $table->decimal('monthly_income', 10, 2)->default(0);
        $table->boolean('is_active')->default(true);
        $table->boolean('is_verified_dependent')->default(false);
        $table->timestamps();
        $table->softDeletes();
    });

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('beneficiary_id');
        $table->string('status');
        $table->timestamp('released_at')->nullable();
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
        $table->unsignedInteger('order_column')->nullable();
        $table->nullableTimestamps();
    });

    $this->municipalId = (string) Str::ulid();
    $this->otherMunicipalId = (string) Str::ulid();
});

afterEach(function () {
    activity()->enableLogging();

    foreach (['media', 'ac_assistance_requests', 'ac_household_members', 'ac_beneficiaries', 'ac_households', 'users'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('returns no people without an identity criterion', function () {
    peopleSearchBeneficiary($this->municipalId, 'Juan');

    $results = app(SearchBeneficiaryAction::class)->execute($this->municipalId);

    expect($results->total())->toBe(0)
        ->and($results->items())->toBeEmpty();
});

it('returns one beneficiary with classified membership history and active unlinked roster matches', function () {
    $primary = peopleSearchHousehold($this->municipalId, 'HH-PRIMARY');
    $otherActive = peopleSearchHousehold($this->municipalId, 'HH-OTHER');
    $former = peopleSearchHousehold($this->municipalId, 'HH-FORMER');
    $beneficiary = peopleSearchBeneficiary($this->municipalId, 'Juan', $primary);

    peopleSearchMember($primary, 'Juan', $beneficiary, true, 'head');
    peopleSearchMember($otherActive, 'Juan', $beneficiary, true, 'sibling');
    peopleSearchMember($former, 'Juan', $beneficiary, false, 'child');
    peopleSearchMember($primary, 'Juan', null, true, 'sibling');
    peopleSearchMember($primary, 'Juan', null, false, 'sibling');
    $deletedMember = peopleSearchMember($primary, 'Juan', null, true, 'sibling');
    $deletedMember->delete();

    $foreignHousehold = peopleSearchHousehold($this->otherMunicipalId, 'HH-FOREIGN');
    peopleSearchMember($foreignHousehold, 'Juan', null, true, 'child');

    $results = app(SearchBeneficiaryAction::class)->execute($this->municipalId, ['search' => 'Juan']);
    $payloads = collect($results->items())->map(fn (array $item) => peopleSearchPayload($item));
    $beneficiaryPayload = $payloads->firstWhere('record_type', 'beneficiary');
    $rosterPayloads = $payloads->where('record_type', 'roster_only');

    expect($results->total())->toBe(2)
        ->and($beneficiaryPayload['id'])->toBe($beneficiary->id)
        ->and($beneficiaryPayload['memberships'])->toHaveCount(3)
        ->and(collect($beneficiaryPayload['memberships'])->pluck('status')->all())
        ->toContain('current_household', 'other_active_household', 'moved_out')
        ->and($beneficiaryPayload['membership_warning']['multiple_active_memberships'])->toBeTrue()
        ->and($rosterPayloads)->toHaveCount(1);
});

it('flags an active beneficiary that lacks a current household roster row', function () {
    $household = peopleSearchHousehold($this->municipalId, 'HH-MISSING');
    $beneficiary = peopleSearchBeneficiary($this->municipalId, 'Pedro', $household);
    peopleSearchMember($household, 'Pedro', $beneficiary, false, 'head');

    $results = app(SearchBeneficiaryAction::class)->execute($this->municipalId, ['search' => 'Pedro']);
    $payload = peopleSearchPayload($results->items()[0]);

    expect($payload['membership_warning']['has_warning'])->toBeTrue()
        ->and($payload['membership_warning']['missing_current_membership'])->toBeTrue();
});

it('filters record type and verification consistently', function () {
    $household = peopleSearchHousehold($this->municipalId, 'HH-FILTER');
    peopleSearchBeneficiary($this->municipalId, 'Verified', $household, ['identity_verified_at' => now()]);
    peopleSearchBeneficiary($this->municipalId, 'Rejected', $household, ['intake_rejected_at' => now()]);
    peopleSearchMember($household, 'Verified', null, true, 'sibling', ['is_verified_dependent' => true]);
    peopleSearchMember($household, 'Pending', null, true, 'child');

    $verifiedRoster = app(SearchBeneficiaryAction::class)->execute($this->municipalId, [
        'barangay' => 'Bangbang',
        'record_type' => 'roster_only',
        'verification' => 'verified',
    ]);
    $rejected = app(SearchBeneficiaryAction::class)->execute($this->municipalId, [
        'barangay' => 'Bangbang',
        'verification' => 'rejected',
    ]);

    expect($verifiedRoster->total())->toBe(1)
        ->and($verifiedRoster->items()[0]['record_type'])->toBe('roster_only')
        ->and($rejected->total())->toBe(1)
        ->and($rejected->items()[0]['record_type'])->toBe('beneficiary');
});

it('paginates the combined people index', function () {
    $household = peopleSearchHousehold($this->municipalId, 'HH-PAGE');
    foreach (range(1, 6) as $number) {
        peopleSearchMember($household, "Person {$number}", null, true, 'child');
    }

    $results = app(SearchBeneficiaryAction::class)->execute($this->municipalId, [
        'search' => 'Person',
        'per_page' => 5,
    ]);

    expect($results->total())->toBe(6)
        ->and($results->perPage())->toBe(5)
        ->and($results->items())->toHaveCount(5);
});

it('accepts the people-search filter values', function () {
    $request = new SearchBeneficiaryRequest;
    $validator = Validator::make([
        'record_type' => 'roster_only',
        'verification' => 'rejected',
    ], $request->rules());

    expect($validator->passes())->toBeTrue();
});

function peopleSearchHousehold(string $municipalId, string $code): Household
{
    return Household::query()->create([
        'municipal_id' => $municipalId,
        'household_code' => $code,
        'barangay' => 'Bangbang',
        'street' => 'Rizal Street',
    ]);
}

function peopleSearchBeneficiary(
    string $municipalId,
    string $firstName,
    ?Household $household = null,
    array $overrides = [],
): Beneficiary {
    $household ??= peopleSearchHousehold($municipalId, 'HH-'.Str::upper(Str::random(6)));

    return Beneficiary::query()->create(array_merge([
        'household_id' => $household->id,
        'municipal_id' => $municipalId,
        'beneficiary_number' => 'GAS-'.Str::upper(Str::random(6)),
        'first_name' => $firstName,
        'last_name' => 'Dela Cruz',
        'sex' => 'male',
        'birth_date' => '1990-01-01',
        'monthly_income' => 0,
    ], $overrides));
}

function peopleSearchMember(
    Household $household,
    string $firstName,
    ?Beneficiary $beneficiary,
    bool $active,
    string $relationship,
    array $overrides = [],
): HouseholdMember {
    return HouseholdMember::query()->create(array_merge([
        'household_id' => $household->id,
        'beneficiary_id' => $beneficiary?->id,
        'first_name' => $firstName,
        'last_name' => 'Dela Cruz',
        'birth_date' => '1990-01-01',
        'sex' => 'male',
        'relationship' => $relationship,
        'monthly_income' => 0,
        'is_active' => $active,
        'is_verified_dependent' => false,
    ], $overrides));
}

function peopleSearchPayload(array $item): array
{
    return (new PeopleSearchResultResource($item))->toArray(Request::create('/'));
}
