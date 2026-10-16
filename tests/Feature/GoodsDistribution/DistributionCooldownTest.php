<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\DistributionCooldown;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\DistributionCooldownService;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
    $this->travelTo(now()->setDate(2026, 10, 9)->startOfDay());
    goodsReceipt($this, true);
});
afterEach(function () {
    $this->travelBack();
    goodsDistributionCleanup();
});

function gdCooldownPolicy(object $test, string $scope = 'recipient', int $duration = 3, string $unit = 'months'): void
{
    $test->program->update(['cooldown_enabled' => true, 'cooldown_scope' => $scope, 'cooldown_duration' => $duration, 'cooldown_unit' => $unit]);
}

function gdCooldownApprove(object $test, DistributionRequest $request, ?string $reason = null): DistributionRequest
{
    $request = goodsTransition($test, $request, 'review');
    $context = app(DistributionCooldownService::class)->context($request, today()->toDateString());

    return goodsTransition($test, $request, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $context['fingerprint'],
        'cooldown_exception_reason' => $reason]);
}

function gdCooldownRelease(object $test, array $data = [], ?string $reason = null): DistributionRequest
{
    $request = gdCooldownApprove($test, goodsRequest($test, $data), $reason);

    return goodsTransition($test, $request, 'release', goodsReleaseData($request));
}

it('starts disabled and captures an explicit policy without fabricating cooldown rows', function () {
    $request = gdCooldownRelease($this);
    expect(DistributionCooldown::count())->toBe(0)->and($request->cooldown_policy['enabled'])->toBeFalse()
        ->and($request->cooldown_policy['ends_on'])->toBeNull();
});

it('calculates calendar months without overflow and exact days weeks and expiry boundaries', function (string $date, string $unit, int $duration, string $end) {
    $service = app(DistributionCooldownService::class);
    expect($service->endDate($date, ['enabled' => true, 'duration' => $duration, 'unit' => $unit]))->toBe($end);
})->with([
    ['2026-01-31', 'months', 1, '2026-02-28'], ['2028-01-31', 'months', 1, '2028-02-29'],
    ['2026-10-09', 'months', 3, '2027-01-09'], ['2026-10-09', 'weeks', 2, '2026-10-23'], ['2026-10-09', 'days', 7, '2026-10-16'],
]);

it('permits encoding but requires an audited decision-maker exception for a repeat handover', function () {
    gdCooldownPolicy($this);
    $first = gdCooldownRelease($this);
    $repeat = goodsTransition($this, goodsRequest($this), 'review');
    $context = app(DistributionCooldownService::class)->context($repeat, today()->toDateString());
    expect($context['blocked'])->toBeTrue()->and($context['next_eligible_on'])->toBe('2027-01-09');
    expect(fn () => goodsTransition($this, $repeat, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $context['fingerprint']]))
        ->toThrow(DomainException::class, 'exception reason');
    $repeat = goodsTransition($this, $repeat, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $context['fingerprint'],
        'cooldown_exception_reason' => 'Urgent family need reviewed']);
    $released = goodsTransition($this, $repeat, 'release', goodsReleaseData($repeat));
    expect($released->cooldown_policy['exception_used'])->toBeTrue()->and(DistributionCooldown::count())->toBe(2)
        ->and($released->cooldown_exception_authorization['actor_user_id'])->toBe($this->actor->id)
        ->and($released->cooldown_exception_authorization['sources'][0]['request_id'])->toBe($first->id);
    expect(DB::table('activity_log')->where('subject_id', $released->id)->where('description', 'Approve goods request')->value('properties'))
        ->toContain('Urgent family need reviewed');
});

it('binds exceptions to live source sets policy identity date and revision', function () {
    gdCooldownPolicy($this);
    $a = gdCooldownApprove($this, goodsRequest($this));
    $b = gdCooldownApprove($this, goodsRequest($this));
    goodsTransition($this, $a, 'release', goodsReleaseData($a));
    expect(fn () => goodsTransition($this, $b, 'release', goodsReleaseData($b)))->toThrow(DomainException::class, 'decision-maker');
    $context = app(DistributionCooldownService::class)->context($b, '2026-10-09');
    $b = goodsTransition($this, $b, 'authorize_cooldown', ['actual_release_on' => '2026-10-09',
        'cooldown_fingerprint' => $context['fingerprint'], 'cooldown_exception_reason' => 'Reviewed repeat household need']);
    $this->travelTo(now()->addDay());
    expect(fn () => goodsTransition($this, $b, 'release', goodsReleaseData($b)))->toThrow(DomainException::class, 'current decision-maker');
    $context = app(DistributionCooldownService::class)->context($b, today()->toDateString());
    gdCooldownPolicy($this, duration: 2, unit: 'weeks');
    expect(fn () => goodsTransition($this, $b, 'authorize_cooldown', ['actual_release_on' => today()->toDateString(),
        'cooldown_fingerprint' => $context['fingerprint'], 'cooldown_exception_reason' => 'Reviewed repeat household need']))->toThrow(DomainException::class, 'context changed');
    $b = goodsTransition($this, $b, 'return', ['reason' => 'Goods quantities need correction']);
    expect($b->cooldown_exception_authorization)->toBeNull()->and(DistributionCooldown::count())->toBe(1);
});

it('never restricts a filer or collector merely for assisting an unlinked recipient and retains later linkage', function () {
    gdCooldownPolicy($this);
    $member = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'relationship' => 'child']);
    gdCooldownRelease($this, ['assisted_household_member_id' => $member->id]);
    $self = goodsRequest($this);
    expect(app(DistributionCooldownService::class)->context($self, today()->toDateString())['blocked'])->toBeFalse();
    $beneficiary = Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id, 'first_name' => 'Kenneth']);
    $member->update(['beneficiary_id' => $beneficiary->id]);
    $repeat = goodsRequest($this, ['assisted_household_member_id' => $member->id]);
    expect(app(DistributionCooldownService::class)->context($repeat, today()->toDateString())['blocked'])->toBeTrue()
        ->and(DistributionCooldown::first()->beneficiary_id)->toBeNull();
});

it('covers the original household new joiners and captured members but not their unrelated new family', function () {
    gdCooldownPolicy($this, 'household', 2, 'weeks');
    $person = Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id, 'first_name' => 'Kenneth']);
    $member = HouseholdMember::create(['household_id' => $this->household->id, 'beneficiary_id' => $person->id, 'first_name' => 'Kenneth', 'relationship' => 'child']);
    gdCooldownRelease($this);
    expect(DistributionCooldown::count())->toBe(2);
    $joiner = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'New member', 'relationship' => 'child']);
    expect(app(DistributionCooldownService::class)->context(goodsRequest($this, ['assisted_household_member_id' => $joiner->id]), today()->toDateString())['blocked'])->toBeTrue();
    $newHousehold = Household::create(['municipal_id' => $this->municipalId, 'household_code' => 'HH-NEW']);
    $member->update(['is_active' => false]);
    $person->update(['household_id' => $newHousehold->id]);
    HouseholdMember::create(['household_id' => $newHousehold->id, 'beneficiary_id' => $person->id, 'first_name' => 'Kenneth', 'relationship' => 'head']);
    $unrelated = HouseholdMember::create(['household_id' => $newHousehold->id, 'first_name' => 'New spouse', 'relationship' => 'spouse']);
    expect(app(DistributionCooldownService::class)->context(goodsRequest($this, ['beneficiary_id' => $person->id]), today()->toDateString())['blocked'])->toBeTrue();
    expect(app(DistributionCooldownService::class)->context(goodsRequest($this, ['beneficiary_id' => $person->id, 'assisted_household_member_id' => $unrelated->id]), today()->toDateString())['blocked'])->toBeFalse();
});

it('keeps existing intervals after policy changes and becomes eligible exactly on expiry', function () {
    gdCooldownPolicy($this, duration: 2, unit: 'weeks');
    gdCooldownRelease($this);
    $row = DistributionCooldown::first();
    $this->program->update(['cooldown_enabled' => false]);
    $request = goodsRequest($this);
    expect(app(DistributionCooldownService::class)->context($request, '2026-10-22')['blocked'])->toBeTrue()
        ->and(app(DistributionCooldownService::class)->context($request, '2026-10-23')['blocked'])->toBeFalse()
        ->and($row->fresh()->ends_on->toDateString())->toBe('2026-10-23');
    expect(fn () => $row->update(['ends_on' => '2026-10-10']))->toThrow(DomainException::class);
});

it('ignores earlier untracked releases but reviews a backdated interval covering a later tracked handover', function () {
    $held = goodsApproval($this, goodsRequest($this));
    $old = gdCooldownRelease($this);
    DB::table('gd_distribution_requests')->where('id', $old->id)->update(['cooldown_policy' => null]);
    $this->travelTo(now()->addDays(10));
    $later = gdCooldownRelease($this);
    gdCooldownPolicy($this);
    $context = app(DistributionCooldownService::class)->context($held, '2026-10-09');
    expect($context['conflicts'])->toHaveCount(1)->and($context['conflicts'][0]['kind'])->toBe('historical_overlap')
        ->and($context['conflicts'][0]['request_id'])->toBe($later->id);
    expect(fn () => goodsTransition($this, $held, 'release', [...goodsReleaseData($held), 'actual_release_on' => '2026-10-09']))->toThrow(DomainException::class);
    $held = goodsTransition($this, $held, 'authorize_cooldown', ['actual_release_on' => '2026-10-09',
        'cooldown_fingerprint' => $context['fingerprint'], 'cooldown_exception_reason' => 'Reviewed actual earlier handover']);
    goodsTransition($this, $held, 'release', [...goodsReleaseData($held), 'actual_release_on' => '2026-10-09']);
    expect(DistributionCooldown::first()->starts_on->toDateString())->toBe('2026-10-09');
});

it('restricts only the same program and excludes financial assistance cooldowns', function () {
    gdCooldownPolicy($this);
    gdCooldownRelease($this);
    $program = Program::create(['municipal_id' => $this->municipalId, 'name' => 'Other goods', 'code' => 'OTHER', 'is_active' => true]);
    $snapshot = app(DistributionRequestService::class)->snapshot($this->municipalId, $this->filer->id, null);
    expect(app(DistributionCooldownService::class)->evaluate($this->municipalId, $program->id, $snapshot, today()->toDateString())['blocked'])->toBeFalse();
});

it('rolls back stock consumption and cooldowns if finalization fails', function () {
    gdCooldownPolicy($this);
    $request = gdCooldownApprove($this, goodsRequest($this));
    Event::listen('eloquent.updated: '.DistributionRequest::class, function ($record) use ($request) {
        if ($record->id === $request->id && $record->status->value === 'released') {
            throw new DomainException('Simulated finalization failure');
        }
    });
    expect(fn () => goodsTransition($this, $request, 'release', goodsReleaseData($request)))->toThrow(DomainException::class, 'Simulated');
    expect(DistributionCooldown::count())->toBe(0)->and(StockMovement::where('type', 'distribution')->count())->toBe(0)
        ->and($request->fresh()->status->value)->toBe('approved')->and($request->allocations()->first()->status)->toBe('reserved');
});

it('enforces exception permissions and tenant-scoped lookups while leaving encoding available', function () {
    gdCooldownPolicy($this);
    gdCooldownRelease($this);
    $request = goodsRequest($this);
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $this->postJson('/api/goods-distribution/requests/cooldown-context', ['program_id' => $this->program->id, 'beneficiary_id' => $this->filer->id])
        ->assertOk()->assertJsonPath('data.blocked', true);
    $this->getJson('/api/goods-distribution/requests/'.$request->id.'/cooldown-context')->assertOk();
    $this->postJson('/api/goods-distribution/requests/'.$request->id.'/cooldown-exception', [])->assertForbidden();
    $this->postJson('/api/goods-distribution/requests', distributionData($this))->assertOk();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->getJson('/api/goods-distribution/requests/'.$request->id.'/cooldown-context')->assertNotFound();
    $this->postJson('/api/goods-distribution/requests/cooldown-context', ['program_id' => $this->program->id, 'beneficiary_id' => $this->filer->id])->assertNotFound();
});

it('validates and audits program policies without letting ordinary activation erase them', function () {
    $action = app(ManageCatalogAction::class);
    $data = ['name' => $this->program->name, 'is_active' => true, 'cooldown_enabled' => true, 'cooldown_scope' => 'household', 'cooldown_unit' => 'weeks', 'cooldown_duration' => 2];
    $program = $action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Programs, $data, $this->program->id));
    expect($program->cooldown_duration)->toBe(2);
    $program = $action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Programs, ['name' => $program->name, 'is_active' => false], $program->id));
    expect($program->cooldown_enabled)->toBeTrue()->and($program->cooldown_unit)->toBe('weeks');
    expect(fn () => $action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Programs, [...$data, 'cooldown_duration' => 0], $program->id)))->toThrow(DomainException::class);
});

it('requires renewed authorization when another exception handover adds a new source', function () {
    gdCooldownPolicy($this);
    gdCooldownRelease($this);
    $held = gdCooldownApprove($this, goodsRequest($this), 'Reviewed urgent additional need');
    gdCooldownRelease($this, reason: 'Reviewed another urgent handover');
    expect(fn () => goodsTransition($this, $held, 'release', goodsReleaseData($held)))->toThrow(DomainException::class, 'current decision-maker');
    $context = app(DistributionCooldownService::class)->context($held, today()->toDateString());
    expect($context['conflicts'])->toHaveCount(2)->and($context['authorization_current'])->toBeFalse();
});

it('retains cooldowns after a confirmed beneficiary merge without repointing source rows', function () {
    gdCooldownPolicy($this);
    gdCooldownRelease($this);
    $oldId = $this->filer->id;
    $canonical = Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id, 'first_name' => 'Susan']);
    $this->member->update(['is_active' => false]);
    HouseholdMember::create(['household_id' => $this->household->id, 'beneficiary_id' => $canonical->id, 'first_name' => 'Susan', 'relationship' => 'head']);
    $this->filer->update(['merged_into_beneficiary_id' => $canonical->id, 'is_active' => false]);
    $request = goodsRequest($this, ['beneficiary_id' => $canonical->id]);
    expect(app(DistributionCooldownService::class)->context($request, today()->toDateString())['blocked'])->toBeTrue()
        ->and(DistributionCooldown::first()->beneficiary_id)->toBe($oldId);
});

it('updates only policy fields through the dedicated inventory-manager command', function () {
    $this->program->update(['name' => 'RENAMED PROGRAM', 'is_active' => false]);
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $url = '/api/goods-distribution/programs/'.$this->program->id.'/cooldown';
    $policy = ['cooldown_enabled' => true, 'cooldown_scope' => 'household', 'cooldown_duration' => 2, 'cooldown_unit' => 'weeks'];
    $this->patchJson($url, [...$policy, 'name' => 'STALE NAME', 'is_active' => true])->assertOk();
    expect($this->program->fresh()->name)->toBe('RENAMED PROGRAM')->and($this->program->fresh()->is_active)->toBeFalse()
        ->and($this->program->fresh()->cooldown_duration)->toBe(2);
    $this->patchJson($url, [...$policy, 'cooldown_duration' => null])->assertUnprocessable();
    $foreign = Program::create(['municipal_id' => $this->otherMunicipalId, 'name' => 'Other municipality', 'code' => 'FOREIGN', 'is_active' => true]);
    $this->patchJson('/api/goods-distribution/programs/'.$foreign->id.'/cooldown', $policy)->assertNotFound();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->patchJson($url, $policy)->assertForbidden();
    app()->instance('municipal_id', $this->municipalId);
    goodsInventoryHttp($this, []);
    $this->patchJson($url, $policy)->assertForbidden();
});

it('ignores cooldown rows that do not belong to a released source in the same program', function () {
    gdCooldownPolicy($this);
    $pending = goodsRequest($this);
    DistributionCooldown::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id,
        'distribution_request_id' => $pending->id, 'household_id' => $this->household->id,
        'household_member_id' => $this->member->id, 'beneficiary_id' => $this->filer->id, 'scope' => 'household',
        'duration' => 3, 'unit' => 'months', 'starts_on' => '2026-10-09', 'ends_on' => '2027-01-09', 'created_at' => now()]);
    $other = goodsRequest($this);
    expect(app(DistributionCooldownService::class)->context($other, today()->toDateString())['blocked'])->toBeFalse();
});
