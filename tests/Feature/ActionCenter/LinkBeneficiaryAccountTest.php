<?php

use App\Core\ActionCenter\Dto\Beneficiary\LinkBeneficiaryAccountDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\UseCase\Beneficiary\LinkBeneficiaryToUserAction;
use App\Core\Users\Models\User;
use App\External\Api\Request\ActionCenter\Beneficiary\LinkBeneficiaryAccountRequest;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

beforeEach(function () {
    activity()->disableLogging();

    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('first_name')->nullable();
        $table->string('last_name')->nullable();
        $table->string('phone')->nullable()->unique();
        $table->string('email')->nullable()->unique();
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
        $table->string('last_name');
        $table->string('middle_name')->nullable();
        $table->string('suffix')->nullable();
        $table->string('sex')->nullable();
        $table->date('birth_date')->nullable();
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
        $table->unique(['user_id', 'municipal_id']);
    });

    $this->municipalId = (string) Str::ulid();
    $this->otherMunicipalId = (string) Str::ulid();
    $this->admin = linkAccountUser('Admin', 'Reviewer', 'admin@example.test');
});

afterEach(function () {
    activity()->enableLogging();

    foreach (['ac_beneficiaries', 'ac_households', 'users'] as $table) {
        Schema::dropIfExists($table);
    }
});

it('links a portal account by email without case sensitivity', function () {
    $account = linkAccountUser('Portal', 'Citizen', 'Citizen@Example.test');
    $beneficiary = linkAccountBeneficiary($this->municipalId);

    $result = app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $beneficiary,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: 'citizen@example.test',
    ));

    expect($result->user_id)->toBe($account->id)
        ->and($result->user?->email)->toBe('Citizen@Example.test');
});

it('links a phone-only portal account using a local Philippine number', function () {
    $account = linkAccountUser('Phone', 'Citizen', null, '639171234567');
    $beneficiary = linkAccountBeneficiary($this->municipalId);

    $result = app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $beneficiary,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: '0917 123 4567',
    ));

    expect($result->user_id)->toBe($account->id)
        ->and($result->user?->phone)->toBe('639171234567')
        ->and($result->user?->email)->toBeNull();
});

it('rejects an identifier that is neither an email nor a valid phone', function () {
    $beneficiary = linkAccountBeneficiary($this->municipalId);

    expect(fn () => app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $beneficiary,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: 'not-an-account',
    )))->toThrow(DomainException::class, 'Enter a valid email address or Philippine mobile number.');
});

it('blocks an account already linked in the same municipality', function () {
    $account = linkAccountUser('Existing', 'Citizen', null, '639181234567');
    linkAccountBeneficiary($this->municipalId, $account->id, 'Existing');
    $target = linkAccountBeneficiary($this->municipalId, null, 'Target');

    expect(fn () => app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $target,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: '09181234567',
    )))->toThrow(DomainException::class, 'That account is already linked to another beneficiary record');
});

it('allows the same account to link one beneficiary in another municipality', function () {
    $account = linkAccountUser('Shared', 'Citizen', null, '639191234567');
    linkAccountBeneficiary($this->otherMunicipalId, $account->id, 'Other Municipality');
    $target = linkAccountBeneficiary($this->municipalId, null, 'Local');

    $result = app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $target,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: '+63 919 123 4567',
    ));

    expect($result->user_id)->toBe($account->id);
});

it('requires a reason when changing an existing account link', function () {
    $oldAccount = linkAccountUser('Old', 'Account', 'old@example.test');
    linkAccountUser('New', 'Account', null, '639151234567');
    $beneficiary = linkAccountBeneficiary($this->municipalId, $oldAccount->id);

    expect(fn () => app(LinkBeneficiaryToUserAction::class)->execute(linkAccountDto(
        beneficiary: $beneficiary,
        municipalId: $this->municipalId,
        adminId: $this->admin->id,
        identifier: '09151234567',
    )))->toThrow(DomainException::class, 'A reason is required when changing an account that is already linked.');
});

it('validates the unified account identifier request field', function () {
    $request = new LinkBeneficiaryAccountRequest;

    expect(Validator::make([], $request->rules())->fails())->toBeTrue()
        ->and(Validator::make(['account_identifier' => '09171234567'], $request->rules())->passes())->toBeTrue()
        ->and(Validator::make(['account_identifier' => 'person@example.test'], $request->rules())->passes())->toBeTrue();
});

function linkAccountUser(string $firstName, string $lastName, ?string $email = null, ?string $phone = null): User
{
    return User::query()->create([
        'id' => (string) Str::ulid(),
        'first_name' => $firstName,
        'last_name' => $lastName,
        'email' => $email,
        'phone' => $phone,
    ]);
}

function linkAccountBeneficiary(
    string $municipalId,
    ?string $userId = null,
    string $firstName = 'Juan',
): Beneficiary {
    $household = Household::query()->create([
        'id' => (string) Str::ulid(),
        'municipal_id' => $municipalId,
        'barangay' => 'Bangbang',
    ]);

    return Beneficiary::query()->create([
        'id' => (string) Str::ulid(),
        'household_id' => $household->id,
        'municipal_id' => $municipalId,
        'user_id' => $userId,
        'first_name' => $firstName,
        'last_name' => 'Dela Cruz',
        'birth_date' => '1990-01-01',
        'monthly_income' => 0,
    ]);
}

function linkAccountDto(
    Beneficiary $beneficiary,
    string $municipalId,
    string $adminId,
    string $identifier,
    ?string $reason = null,
): LinkBeneficiaryAccountDto {
    return new LinkBeneficiaryAccountDto(
        beneficiaryId: $beneficiary->id,
        municipalId: $municipalId,
        actingAdminId: $adminId,
        accountIdentifier: $identifier,
        reason: $reason,
    );
}
