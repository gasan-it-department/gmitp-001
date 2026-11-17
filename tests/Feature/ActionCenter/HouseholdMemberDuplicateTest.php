<?php

use App\Core\ActionCenter\Dto\Household\HouseholdMemberDuplicateReviewDto;
use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Exceptions\HouseholdMemberDeclarationException;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\ActionCenter\Services\HouseholdMemberDuplicateService;
use App\Core\ActionCenter\UseCase\Household\DeclareHouseholdMemberForAssistanceAction;
use App\Core\ActionCenter\UseCase\Household\StoreAdminHouseholdMemberAction;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';

beforeEach(function () {
    goodsDistributionFixture($this);
    Schema::table('ac_household_members', function (Blueprint $t) {
        foreach (['civil_status', 'educational_attainment', 'occupation', 'religion_id'] as $column) {
            $t->string($column)->nullable();
        }
        $t->decimal('monthly_income', 10, 2)->default(0);
        $t->boolean('is_verified_dependent')->default(false);
    });
    Schema::table('ac_beneficiaries', function (Blueprint $t) {
        $t->ulid('user_id')->nullable();
    });
    $this->actor->givePermissionTo(['action_center.access', 'action_center.beneficiaries.view', 'action_center.beneficiaries.manage']);
    $this->actingAs($this->actor);
    $this->elsewhere = Household::create(['municipal_id' => $this->municipalId, 'household_code' => 'HH-OTHER', 'barangay' => 'Dili']);
    $this->identity = ['first_name' => 'Pedro', 'middle_name' => 'Santos', 'last_name' => 'Cruz', 'suffix' => null, 'birth_date' => '1995-01-02'];
    $this->dto = StoreHouseholdMemberDto::fromArray([...$this->identity, 'relationship' => 'sibling'], $this->household->id);
    $this->duplicates = app(HouseholdMemberDuplicateService::class);
});

afterEach(fn () => goodsDistributionCleanup());

function createPossibleMember(object $test, ?Household $household = null, array $overrides = []): HouseholdMember
{
    return HouseholdMember::create([...$test->identity, 'household_id' => ($household ?? $test->elsewhere)->id,
        'relationship' => 'sibling', 'is_active' => true, ...$overrides]);
}

function memberReview(object $test): HouseholdMemberDuplicateReviewDto
{
    $result = $test->duplicates->check($test->identity, $test->household->id, $test->municipalId, $test->actor->id);

    return new HouseholdMemberDuplicateReviewDto($result['context'], 'Interview confirmed these are two different people.', true);
}

it('adds a nonmatching member normally without changing the household head', function () {
    $member = app(StoreAdminHouseholdMemberAction::class)->execute($this->filer, $this->dto, $this->municipalId, false);
    expect($member->is_verified_dependent)->toBeFalse()->and($member->beneficiary_id)->toBeNull()
        ->and($this->household->fresh()->activeHead->id)->toBe($this->member->id);
});

it('detects roster-only members and beneficiaries, deduplicates linked mirrors and isolates municipalities', function () {
    $registered = Beneficiary::create([...$this->identity, 'municipal_id' => $this->municipalId, 'household_id' => $this->elsewhere->id, 'is_active' => true]);
    createPossibleMember($this, overrides: ['beneficiary_id' => $registered->id]);
    $unlinked = createPossibleMember($this);
    createPossibleMember($this, overrides: ['is_active' => false]);
    $foreign = Household::create(['municipal_id' => $this->otherMunicipalId, 'household_code' => 'PRIVATE-HOUSEHOLD']);
    createPossibleMember($this, $foreign);
    $result = $this->duplicates->check($this->identity, $this->household->id, $this->municipalId, $this->actor->id);
    expect($result['candidates'])->toHaveCount(2)
        ->and(array_column($result['candidates'], 'key'))->toContain('member:'.$unlinked->id, 'beneficiary:'.$registered->id)
        ->and(json_encode($result))->not->toContain('PRIVATE-HOUSEHOLD');
});

it('requires a reviewed reason and audits a different-person addition without transferring existing members', function () {
    $existing = createPossibleMember($this);
    $action = app(StoreAdminHouseholdMemberAction::class);
    expect(fn () => $action->execute($this->filer, $this->dto, $this->municipalId, false))->toThrow(DomainException::class, 'Review possible');
    $review = memberReview($this);
    expect(fn () => $action->execute($this->filer, $this->dto, $this->municipalId, false,
        new HouseholdMemberDuplicateReviewDto($review->context, 'short', true)))->toThrow(DomainException::class, 'review reason');
    $saved = $action->execute($this->filer, $this->dto, $this->municipalId, false, $review);
    expect($existing->fresh()->household_id)->toBe($this->elsewhere->id)->and($existing->fresh()->is_active)->toBeTrue()
        ->and($saved->household_id)->toBe($this->household->id)
        ->and(DB::table('activity_log')->where('description', 'Added a household member after reviewing possible matches as a different person')->count())->toBe(1);
});

it('rejects stale, changed identity, wrong household, expired and forged review contexts', function () {
    createPossibleMember($this);
    $review = memberReview($this);
    createPossibleMember($this, overrides: ['middle_name' => 'Other']);
    expect(fn () => $this->duplicates->authorize($this->dto, $this->municipalId, $this->actor->id, $review))->toThrow(DomainException::class, 'changed or expired');
    $review = memberReview($this);
    $otherDto = StoreHouseholdMemberDto::fromArray([...$this->identity, 'middle_name' => 'Changed', 'relationship' => 'sibling'], $this->household->id);
    expect(fn () => $this->duplicates->authorize($otherDto, $this->municipalId, $this->actor->id, $review))->toThrow(DomainException::class, 'changed or expired');
    expect(fn () => $this->duplicates->authorize($this->dto, $this->municipalId, 'another-actor', $review))->toThrow(DomainException::class, 'changed or expired');
    $wrongHouseholdDto = StoreHouseholdMemberDto::fromArray([...$this->identity, 'relationship' => 'sibling'], $this->elsewhere->id);
    expect(fn () => $this->duplicates->authorize($wrongHouseholdDto, $this->municipalId, $this->actor->id, $review))->toThrow(DomainException::class, 'changed or expired');
    expect(fn () => $this->duplicates->authorize($this->dto, $this->municipalId, $this->actor->id, new HouseholdMemberDuplicateReviewDto($review->context, $review->reason, false)))->toThrow(DomainException::class, 'Confirm this is a different person');
    expect(fn () => $this->duplicates->authorize($this->dto, $this->municipalId, $this->actor->id, new HouseholdMemberDuplicateReviewDto('forged', $review->reason, true)))->toThrow(DomainException::class, 'Review possible');
    $this->travel(31)->minutes();
    expect(fn () => $this->duplicates->authorize($this->dto, $this->municipalId, $this->actor->id, $review))->toThrow(DomainException::class, 'changed or expired');
    $this->travelBack();
});

it('rechecks after a no-match preview so a candidate appearing before Save is not bypassed', function () {
    $review = memberReview($this);
    $action = app(StoreAdminHouseholdMemberAction::class);
    $action->execute($this->filer, $this->dto, $this->municipalId, false, $review);
    expect(fn () => $action->execute($this->filer, $this->dto, $this->municipalId, false, $review))->toThrow(DomainException::class, 'changed or expired');
    expect(HouseholdMember::where('household_id', $this->household->id)->where('first_name', 'PEDRO')->count())->toBe(1);
});

it('matches normalized names, permits different known birthdays and warns when a birthday is missing', function () {
    createPossibleMember($this, overrides: ['first_name' => '  PEDRO-  ', 'last_name' => 'cruz', 'birth_date' => '1996-01-02']);
    expect($this->duplicates->candidates($this->identity, $this->municipalId))->toBeEmpty();
    createPossibleMember($this, overrides: ['birth_date' => null]);
    expect($this->duplicates->candidates($this->identity, $this->municipalId))->toHaveCount(1)
        ->and($this->duplicates->candidates([...$this->identity, 'birth_date' => null], $this->municipalId))->toHaveCount(2);
});

it('does not expose another household through citizen declaration errors', function () {
    createPossibleMember($this);
    DB::table('ac_beneficiaries')->where('id', $this->filer->id)->update(['user_id' => $this->actor->id, 'identity_verified_at' => now()]);
    try {
        app(DeclareHouseholdMemberForAssistanceAction::class)->execute($this->filer->fresh(), $this->dto, $this->actor->id, $this->municipalId);
        $this->fail('A possible duplicate must be reviewed by staff.');
    } catch (HouseholdMemberDeclarationException $exception) {
        expect($exception->getMessage())->toContain('Please ask MSWD')->not->toContain('HH-OTHER', 'Dili', 'Pedro');
    }
});

it('validates and authorizes both admin lookup paths and rechecks direct API creation', function () {
    $this->withoutMiddleware([\App\Http\Middleware\Municipality\SetMunicipalityContext::class, \App\Http\Middleware\Admin\AdminGuardMiddleware::class, \App\Http\Middleware\HandleInertiaRequests::class]);
    createPossibleMember($this);
    $base = '/api/action-center/households/'.$this->household->id.'/members';
    $this->postJson($base.'/check', $this->identity)->assertOk()->assertJsonPath('candidates.0.household_code', 'HH-OTHER')
        ->assertJsonMissingPath('candidates.0.contact_phone')->assertJsonMissingPath('candidates.0.monthly_income');
    $this->postJson('/api/action-center/beneficiary/'.$this->filer->id.'/household/members/check', $this->identity)->assertOk();
    $foreign = Household::create(['municipal_id' => $this->otherMunicipalId, 'household_code' => 'FOREIGN']);
    $this->postJson('/api/action-center/households/'.$foreign->id.'/members/check', $this->identity)->assertNotFound();
    $this->postJson($base.'/check', ['first_name' => 'P'])->assertUnprocessable();
    $this->postJson($base, [...$this->identity, 'relationship' => 'sibling'])->assertUnprocessable()->assertJsonValidationErrors('member');
    $review = memberReview($this);
    $this->postJson($base, [...$this->identity, 'relationship' => 'sibling', 'duplicate_review_context' => $review->context,
        'confirm_different_person' => true, 'different_person_reason' => $review->reason])->assertCreated();
    $this->actor->revokePermissionTo('action_center.beneficiaries.manage');
    $this->postJson($base.'/check', $this->identity)->assertForbidden();
});

it('rejects an exception when editing permission is revoked after the review', function () {
    createPossibleMember($this);
    $review = memberReview($this);
    $this->actor->revokePermissionTo('action_center.beneficiaries.manage');
    expect(fn () => app(StoreAdminHouseholdMemberAction::class)->execute($this->filer, $this->dto, $this->municipalId, false, $review))
        ->toThrow(DomainException::class, 'authorized household editor');
});
