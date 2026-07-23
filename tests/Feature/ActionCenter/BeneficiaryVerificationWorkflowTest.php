<?php

use App\Core\ActionCenter\Dto\Beneficiary\ReviewBeneficiaryIntakeDto;
use App\Core\ActionCenter\Dto\Beneficiary\UpdateBeneficiaryProfileDto;
use App\Core\ActionCenter\Dto\Household\ChangeHouseholdHeadDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Dto\Household\UpdateHouseholdMemberDto;
use App\Core\ActionCenter\Enums\HeadDepartureDisposition;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\UseCase\Beneficiary\CheckElegibilityAction;
use App\Core\ActionCenter\UseCase\Beneficiary\RejectBeneficiaryIntakeAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ResolveBeneficiaryIdentityGroupAction;
use App\Core\ActionCenter\UseCase\Beneficiary\ReviewBeneficiaryIntakeAction;
use App\Core\ActionCenter\UseCase\Beneficiary\SearchHouseholdMembershipAction;
use App\Core\ActionCenter\UseCase\Beneficiary\UpdateBeneficiaryProfileAction;
use App\Core\ActionCenter\UseCase\Household\ChangeHouseholdHeadAction;
use App\Core\ActionCenter\UseCase\Household\DeclareHouseholdMemberForAssistanceAction;
use App\Core\ActionCenter\UseCase\Household\StoreAdminHouseholdMemberAction;
use App\Core\ActionCenter\UseCase\Household\UnlinkHouseholdMemberBeneficiaryAction;
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

    Schema::create('ac_assistance_requests', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('on_behalf_household_member_id')->nullable();
        $table->softDeletes();
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
    Schema::dropIfExists('ac_assistance_requests');
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
        householdResolutionReason: null,
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
        householdResolutionReason: null,
        verifiedMemberIds: [$accepted->id],
        rejectedMemberIds: [],
    )))->toThrow(DomainException::class, 'already been verified');
});

it('rejects a portal beneficiary intake with a reason while preserving the household', function () {
    [$beneficiary, $head] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        userId: $this->adminId,
    );
    $dependent = createDependent($beneficiary->household_id, 'PEDRO', 'CRUZ');
    $reason = 'The uploaded identity document does not match the claimant presented during review.';

    $rejected = app(RejectBeneficiaryIntakeAction::class)->execute(
        $beneficiary->id,
        $this->municipalId,
        $this->adminId,
        $reason,
    );

    expect($rejected->intakeStatus())->toBe('rejected')
        ->and($rejected->intake_rejected_at)->not->toBeNull()
        ->and($rejected->intake_rejected_by_user_id)->toBe($this->adminId)
        ->and($rejected->intake_rejection_reason)->toBe($reason)
        ->and($rejected->identity_verified_at)->toBeNull()
        ->and($rejected->identity_verified_by_user_id)->toBeNull()
        ->and($rejected->is_active)->toBeTrue()
        ->and($rejected->household()->exists())->toBeTrue()
        ->and($head->fresh()->trashed())->toBeFalse()
        ->and($dependent->fresh()->trashed())->toBeFalse();
});

it('blocks rejected intakes from later verification and assistance eligibility', function () {
    [$beneficiary] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        userId: $this->adminId,
    );

    app(RejectBeneficiaryIntakeAction::class)->execute(
        $beneficiary->id,
        $this->municipalId,
        $this->adminId,
        'The submitted identity cannot be verified after document and interview review.',
    );

    expect(fn () => app(ReviewBeneficiaryIntakeAction::class)->execute(new ReviewBeneficiaryIntakeDto(
        beneficiaryId: $beneficiary->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        householdResolution: 'keep_existing',
        targetMemberId: null,
        householdResolutionReason: null,
        verifiedMemberIds: [],
        rejectedMemberIds: [],
    )))->toThrow(DomainException::class, 'already been rejected');

    $type = new AssistanceType(['name' => 'Medical']);
    $type->id = (string) Str::ulid();
    $eligibility = new CheckElegibilityAction(new ResolveBeneficiaryIdentityGroupAction);

    expect($eligibility->execute($beneficiary->fresh(), $type)->reason)->toBe('intake_rejected');
});

it('does not reject verified, walk-in, or merged beneficiary records through intake rejection', function () {
    [$verified] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId, userId: $this->adminId);
    [$walkIn] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ');
    [$canonical] = createClaimant($this->municipalId, 'ANA', 'CRUZ', verifiedBy: $this->adminId, userId: $this->adminId);
    [$merged] = createClaimant($this->municipalId, 'ANA', 'CRUZ', userId: $this->adminId);
    $merged->forceFill(['merged_into_beneficiary_id' => $canonical->id])->save();

    $reject = app(RejectBeneficiaryIntakeAction::class);

    expect(fn () => $reject->execute($verified->id, $this->municipalId, $this->adminId, 'Already verified person.'))
        ->toThrow(DomainException::class, 'already been verified')
        ->and(fn () => $reject->execute($walkIn->id, $this->municipalId, $this->adminId, 'Walk-in record.'))
        ->toThrow(DomainException::class, 'portal-submitted')
        ->and(fn () => $reject->execute($merged->id, $this->municipalId, $this->adminId, 'Merged record.'))
        ->toThrow(DomainException::class, 'already merged');
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
        householdResolutionReason: null,
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

it('requires a reason for a controlled non-exact household membership match', function () {
    [$juan] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    $misspelledPedro = createDependent($juan->household_id, 'PEDROO', 'CRUZ', '1992-04-10', true);

    [$pedro] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ', '1992-04-10');

    $review = fn (?string $reason) => app(ReviewBeneficiaryIntakeAction::class)->execute(new ReviewBeneficiaryIntakeDto(
        beneficiaryId: $pedro->id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        householdResolution: 'join_existing',
        targetMemberId: $misspelledPedro->id,
        householdResolutionReason: $reason,
        verifiedMemberIds: [],
        rejectedMemberIds: [],
    ));

    expect(fn () => $review(null))->toThrow(DomainException::class, 'Explain why');

    $review('Government ID and in-person interview confirmed the spelling error.');

    expect($pedro->fresh()->household_id)->toBe($juan->household_id)
        ->and($misspelledPedro->fresh()->beneficiary_id)->toBe($pedro->id);
});

it('searches only verified households in the acting municipality', function () {
    [$claimant] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ');
    [$localHead] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    $localMember = createDependent($localHead->household_id, 'PEDROO', 'CRUZ', '1992-04-10', true);

    $otherMunicipalId = (string) Str::ulid();
    DB::table('municipalities')->insert(['id' => $otherMunicipalId]);
    [$otherHead] = createClaimant($otherMunicipalId, 'OTHER', 'HEAD', verifiedBy: $this->adminId);
    createDependent($otherHead->household_id, 'PEDRO', 'CRUZ', '1992-04-10', true);

    $results = app(SearchHouseholdMembershipAction::class)->execute(
        $claimant,
        $this->municipalId,
        'Pedro',
    );

    expect($results)->toHaveCount(1)
        ->and($results->first()['member_id'])->toBe($localMember->id)
        ->and($results->first()['is_exact_match'])->toBeFalse();
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
        contactPhone: null,
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

    $pendingMember = createDependent($beneficiary->household_id, 'MARIA', 'CRUZ', verified: false);

    $action->execute(UpdateHouseholdMemberDto::fromArray([
        'first_name' => 'MARIA TERESA',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
        'birth_date' => '1995-08-20',
        'monthly_income' => 0,
        'is_verified_dependent' => true,
    ], $pendingMember->id, $this->municipalId));

    expect($pendingMember->fresh()->is_verified_dependent)->toBeTrue();
});

it('allows only one unresolved citizen-declared member at a time', function () {
    [$beneficiary] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        verifiedBy: $this->adminId,
    );
    $beneficiary->update(['user_id' => $this->adminId]);

    $action = app(DeclareHouseholdMemberForAssistanceAction::class);
    $declare = fn (string $firstName) => $action->execute(
        beneficiary: $beneficiary->fresh(),
        dto: StoreHouseholdMemberDto::fromArray([
            'first_name' => $firstName,
            'last_name' => 'CRUZ',
            'relationship' => 'sibling',
        ], $beneficiary->household_id),
        actingUserId: $this->adminId,
        municipalId: $this->municipalId,
    );

    $first = $declare('PEDRO');

    expect($first->is_verified_dependent)->toBeFalse()
        ->and(fn () => $declare('ANA'))->toThrow(
            \App\Core\ActionCenter\Exceptions\HouseholdMemberDeclarationException::class,
            'Only one unresolved member',
        );

    $first->update(['is_verified_dependent' => true]);

    expect($declare('ANA')->is_verified_dependent)->toBeFalse();
});

it('lets direct admin member creation choose pending or verified without the citizen limit', function () {
    [$beneficiary] = createClaimant($this->municipalId, 'JUAN', 'CRUZ');
    $action = app(StoreAdminHouseholdMemberAction::class);
    $dto = StoreHouseholdMemberDto::fromArray([
        'first_name' => 'PEDRO',
        'last_name' => 'CRUZ',
        'relationship' => 'sibling',
    ], $beneficiary->household_id);

    $pending = $action->execute(
        beneficiary: $beneficiary,
        dto: $dto,
        municipalId: $this->municipalId,
        isVerifiedDependent: false,
    );
    $secondPending = $action->execute(
        beneficiary: $beneficiary,
        dto: StoreHouseholdMemberDto::fromArray([
            'first_name' => 'MARIA',
            'last_name' => 'CRUZ',
            'relationship' => 'parent',
        ], $beneficiary->household_id),
        municipalId: $this->municipalId,
        isVerifiedDependent: false,
    );
    $verified = $action->execute(
        beneficiary: $beneficiary,
        dto: StoreHouseholdMemberDto::fromArray([
            'first_name' => 'ANA',
            'last_name' => 'CRUZ',
            'relationship' => 'child',
        ], $beneficiary->household_id),
        municipalId: $this->municipalId,
        isVerifiedDependent: true,
    );

    expect($pending->is_verified_dependent)->toBeFalse()
        ->and($secondPending->is_verified_dependent)->toBeFalse()
        ->and($verified->is_verified_dependent)->toBeTrue();
});

it('unlinks a secondary beneficiary profile without changing either record lifecycle', function () {
    [$juan] = createClaimant($this->municipalId, 'JUAN', 'CRUZ', verifiedBy: $this->adminId);
    [$pedro] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ', verifiedBy: $this->adminId);
    $member = createDependent($juan->household_id, 'PEDRO', 'CRUZ', verified: true);
    $member->update(['beneficiary_id' => $pedro->id]);

    app(UnlinkHouseholdMemberBeneficiaryAction::class)->execute(
        memberId: $member->id,
        reason: 'Government ID confirmed this link was assigned to the wrong Pedro Cruz.',
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
    );

    expect($member->fresh()->beneficiary_id)->toBeNull()
        ->and($member->fresh()->is_verified_dependent)->toBeTrue()
        ->and($member->fresh()->is_active)->toBeTrue()
        ->and($pedro->fresh()->is_active)->toBeTrue()
        ->and($pedro->fresh()->household_id)->not->toBe($juan->household_id);
});

it('blocks unlinking a primary household membership or an assistance-referenced member', function () {
    [$beneficiary, $primaryMember] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        verifiedBy: $this->adminId,
    );
    $action = app(UnlinkHouseholdMemberBeneficiaryAction::class);

    expect(fn () => $action->execute(
        memberId: $primaryMember->id,
        reason: 'Attempted primary membership correction through the simple unlink action.',
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
    ))->toThrow(DomainException::class, 'household head cannot be unlinked');

    [$pedro] = createClaimant($this->municipalId, 'PEDRO', 'CRUZ', verifiedBy: $this->adminId);
    $referencedMember = createDependent($beneficiary->household_id, 'PEDRO', 'CRUZ', verified: true);
    $referencedMember->update(['beneficiary_id' => $pedro->id]);
    DB::table('ac_assistance_requests')->insert([
        'id' => (string) Str::ulid(),
        'on_behalf_household_member_id' => $referencedMember->id,
    ]);

    expect(fn () => $action->execute(
        memberId: $referencedMember->id,
        reason: 'Attempted to unlink a member already used by an assistance request.',
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
    ))->toThrow(DomainException::class, 'referenced by an assistance request');
});

it('changes the household head only to an eligible verified adult', function () {
    [$formerHead, $formerHeadRow] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        verifiedBy: $this->adminId,
    );
    [$successor, $successorRow] = createVerifiedSuccessor(
        $formerHead->household_id,
        $this->municipalId,
        $this->adminId,
    );

    app(ChangeHouseholdHeadAction::class)->execute(new ChangeHouseholdHeadDto(
        householdId: $formerHead->household_id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        successorMemberId: $successorRow->id,
        currentHeadDisposition: HeadDepartureDisposition::RemainsMember,
        formerHeadRelationship: 'parent',
        reason: 'Family confirmed the new household representative.',
    ));

    expect($formerHeadRow->fresh()->relationship)->toBe('parent')
        ->and($formerHeadRow->fresh()->is_active)->toBeTrue()
        ->and($formerHeadRow->fresh()->is_verified_dependent)->toBeTrue()
        ->and($formerHead->fresh()->is_active)->toBeTrue()
        ->and($successorRow->fresh()->relationship)->toBe('head')
        ->and($successorRow->fresh()->is_verified_dependent)->toBeFalse()
        ->and($successor->fresh()->is_active)->toBeTrue()
        ->and(HouseholdMember::query()
            ->where('household_id', $formerHead->household_id)
            ->where('relationship', 'head')
            ->where('is_active', true)
            ->count())->toBe(1);
});

it('places a household on hold and later assigns an eligible head', function () {
    [$formerHead, $formerHeadRow] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        verifiedBy: $this->adminId,
    );
    [$successor, $successorRow] = createVerifiedSuccessor(
        $formerHead->household_id,
        $this->municipalId,
        $this->adminId,
    );
    $action = app(ChangeHouseholdHeadAction::class);

    $action->execute(new ChangeHouseholdHeadDto(
        householdId: $formerHead->household_id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        successorMemberId: null,
        currentHeadDisposition: HeadDepartureDisposition::MovedOut,
        formerHeadRelationship: null,
        reason: 'Former head moved to another residence.',
    ));

    expect($formerHeadRow->fresh()->is_active)->toBeFalse()
        ->and($formerHead->fresh()->is_active)->toBeFalse()
        ->and($formerHead->household->fresh()->activeHead()->exists())->toBeFalse();

    $type = new AssistanceType(['name' => 'Medical']);
    $type->id = (string) Str::ulid();
    $eligibility = new CheckElegibilityAction(new ResolveBeneficiaryIdentityGroupAction);

    expect($eligibility->execute($successor->fresh(), $type)->reason)
        ->toBe('household_head_required');

    $action->execute(new ChangeHouseholdHeadDto(
        householdId: $formerHead->household_id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        successorMemberId: $successorRow->id,
        currentHeadDisposition: null,
        formerHeadRelationship: null,
        reason: 'Adult successor completed identity and residence review.',
    ));

    expect($successorRow->fresh()->relationship)->toBe('head')
        ->and($formerHead->household->fresh()->isVerified())->toBeTrue();
});

it('rejects an unverified or non-primary-household successor', function () {
    [$formerHead] = createClaimant(
        $this->municipalId,
        'JUAN',
        'CRUZ',
        verifiedBy: $this->adminId,
    );
    $unverified = createDependent($formerHead->household_id, 'PEDRO', 'CRUZ', verified: false);

    expect(fn () => app(ChangeHouseholdHeadAction::class)->execute(new ChangeHouseholdHeadDto(
        householdId: $formerHead->household_id,
        municipalId: $this->municipalId,
        actingAdminId: $this->adminId,
        successorMemberId: $unverified->id,
        currentHeadDisposition: HeadDepartureDisposition::MovedOut,
        formerHeadRelationship: null,
        reason: 'Attempted invalid successor assignment.',
    )))->toThrow(DomainException::class, 'relationship is not verified');
});

function createClaimant(
    string $municipalId,
    string $firstName,
    string $lastName,
    string $birthDate = '1990-01-01',
    ?string $verifiedBy = null,
    ?string $userId = null,
): array {
    $household = Household::create([
        'municipal_id' => $municipalId,
        'barangay' => 'POBLACION',
        'street' => 'RIZAL',
    ]);

    $beneficiary = Beneficiary::create([
        'household_id' => $household->id,
        'user_id' => $userId,
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

function createVerifiedSuccessor(
    string $householdId,
    string $municipalId,
    string $verifiedBy,
): array {
    $beneficiary = Beneficiary::create([
        'household_id' => $householdId,
        'municipal_id' => $municipalId,
        'first_name' => 'PEDRO',
        'last_name' => 'CRUZ',
        'sex' => 'male',
        'birth_date' => '1992-04-10',
        'civil_status' => 'single',
        'occupation' => 'FARMER',
        'monthly_income' => 5000,
        'terms_consented_at' => now(),
        'terms_version' => 'v1.0',
        'identity_verified_at' => now(),
        'identity_verified_by_user_id' => $verifiedBy,
    ]);

    $member = HouseholdMember::create([
        'household_id' => $householdId,
        'beneficiary_id' => $beneficiary->id,
        'first_name' => 'PEDRO',
        'last_name' => 'CRUZ',
        'birth_date' => '1992-04-10',
        'relationship' => 'sibling',
        'is_active' => true,
        'is_verified_dependent' => true,
    ]);

    return [$beneficiary, $member];
}
