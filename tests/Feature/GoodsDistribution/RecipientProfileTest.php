<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\ReadGoodsRecipientProfileAction;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\GoodsRecipientIdentityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
});
afterEach(function () {
    $this->travelBack();
    goodsDistributionCleanup();
});

function recipientProfileRead(object $test, string $id, array $filters = [], string $kind = 'beneficiary'): array
{
    return app(ReadGoodsRecipientProfileAction::class)->execute($test->municipalId,
        app(GoodsRecipientIdentityService::class)->resolve($test->municipalId, $kind, $id), $filters);
}

function recipientProfileRelease(object $test, array $changes = [], array $evidence = []): DistributionRequest
{
    $request = goodsApproval($test, goodsRequest($test, $changes));

    return goodsTransition($test, $request, 'release', [...goodsReleaseData($request), ...$evidence]);
}

it('separates goods intended for Susan from requests she filed for Kenneth and collector names', function () {
    goodsReceipt($this, true);
    $kenneth = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    $own = recipientProfileRelease($this);
    $other = recipientProfileRelease($this, ['assisted_household_member_id' => $kenneth->id], [
        'collector_type' => 'representative', 'collector_name' => 'Susan Solis', 'collector_relationship' => 'Parent',
        'collector_id_type' => 'National ID', 'collector_id_last_four' => 'AB12',
    ]);
    $received = recipientProfileRead($this, $this->filer->id, ['tab' => 'received']);
    expect($received['records']['meta']['total'])->toBe(1)->and($received['totals'][0]['quantity'])->toBe('2.000');
    $requests = recipientProfileRead($this, $this->filer->id, ['tab' => 'requests']);
    expect(collect($requests['records']['data'])->pluck('role', 'id')->all())->toMatchArray([$own->id => 'both', $other->id => 'filer']);
    $member = recipientProfileRead($this, $kenneth->id, ['tab' => 'received'], 'member');
    expect($member['records']['meta']['total'])->toBe(1)->and($member['records']['data'][0]['collector_name'])->toBe('Susan Solis')
        ->and($member['totals'][0]['quantity'])->toBe('2.000');
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'requests', 'role' => 'recipient'])['records']['meta']['total'])->toBe(1);
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'requests', 'role' => 'filer'])['records']['meta']['total'])->toBe(2);
});

it('excludes every unreleased status and returns only minimal frozen history fields', function () {
    goodsReceipt($this, true);
    $released = recipientProfileRelease($this);
    foreach (['draft', 'pending', 'under_review', 'returned', 'approved', 'cancelled'] as $status) {
        $request = goodsRequest($this);
        DB::table('gd_distribution_requests')->where('id', $request->id)->update(['status' => $status]);
    }
    $received = recipientProfileRead($this, $this->filer->id, ['tab' => 'received']);
    expect($received['records']['meta']['total'])->toBe(1)->and($received['records']['data'][0]['id'])->toBe($released->id)
        ->and(array_keys($received['records']['data'][0]))->not->toContain('documents', 'collector_id_last_four', 'collector_id_type', 'media', 'notes');
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'requests'])['records']['meta']['total'])->toBe(7);
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'requests', 'status' => 'draft'])['records']['meta']['total'])->toBe(1);
});

it('retains unlinked member history after registration and rejects conflicting frozen beneficiary identities', function () {
    goodsReceipt($this, true);
    $member = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    $old = recipientProfileRelease($this, ['assisted_household_member_id' => $member->id]);
    $beneficiary = Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis']);
    $member->update(['beneficiary_id' => $beneficiary->id]);
    $new = recipientProfileRelease($this, ['assisted_household_member_id' => $member->id]);
    $identity = app(GoodsRecipientIdentityService::class)->resolve($this->municipalId, 'member', $member->id);
    expect($identity['redirect_beneficiary_id'])->toBe($beneficiary->id);
    expect(recipientProfileRead($this, $beneficiary->id, ['tab' => 'received'])['totals'][0]['quantity'])->toBe('4.000');
    $member->update(['beneficiary_id' => $this->filer->id]);
    $read = recipientProfileRead($this, $this->filer->id, ['tab' => 'received']);
    expect(collect($read['records']['data'])->pluck('id')->all())->toContain($old->id)->not->toContain($new->id);
    expect($new->fresh()->handover_snapshot['subject']['beneficiary_id'])->toBe($beneficiary->id);
});

it('combines explicit merged identities including archived duplicates without rewriting requests', function () {
    goodsReceipt($this, true);
    $old = recipientProfileRelease($this);
    $canonical = Beneficiary::create(['municipal_id' => $this->municipalId, 'household_id' => $this->household->id, 'first_name' => 'Susan', 'last_name' => 'Solis']);
    $this->filer->update(['merged_into_beneficiary_id' => $canonical->id, 'is_active' => false]);
    DB::table('ac_beneficiaries')->where('id', $this->filer->id)->update(['deleted_at' => now()]);
    $read = recipientProfileRead($this, $canonical->id, ['tab' => 'received']);
    expect($read['records']['meta']['total'])->toBe(1)->and($read['totals'][0]['quantity'])->toBe('2.000')
        ->and($old->fresh()->beneficiary_id)->toBe($this->filer->id);
    expect(app(GoodsRecipientIdentityService::class)->resolve($this->municipalId, 'beneficiary', $this->filer->id)['redirect_beneficiary_id'])->toBe($canonical->id);
});

it('keeps handover names and household details frozen after registry corrections and transfers', function () {
    goodsReceipt($this, true);
    $request = recipientProfileRelease($this);
    $snapshot = $request->handover_snapshot;
    $household = Household::create(['municipal_id' => $this->municipalId, 'household_code' => 'HH-NEW', 'barangay' => 'Pinggan']);
    $this->member->update(['is_active' => false]);
    $this->filer->update(['household_id' => $household->id, 'first_name' => 'Corrected Susan']);
    HouseholdMember::create(['household_id' => $household->id, 'beneficiary_id' => $this->filer->id, 'first_name' => 'Corrected Susan', 'relationship' => 'head']);
    $overview = app(GoodsRecipientIdentityService::class)->resolve($this->municipalId, 'beneficiary', $this->filer->id);
    $received = recipientProfileRead($this, $this->filer->id, ['tab' => 'received']);
    expect($overview['profile']['household']['code'])->toBe('HH-NEW')->and($overview['can_create'])->toBeTrue()
        ->and($received['records']['data'][0]['household_code'])->toBe('HH-GD-1')
        ->and($received['records']['data'][0]['recipient_name'])->toBe('Susan Solis')->and($request->fresh()->handover_snapshot)->toBe($snapshot);
    DB::table('ac_beneficiaries')->where('id', $this->filer->id)->update(['deleted_at' => now()]);
    expect(recipientProfileRead($this, $this->filer->id)['summary']['released_count'])->toBe(1);
    expect(app(GoodsRecipientIdentityService::class)->resolve($this->municipalId, 'beneficiary', $this->filer->id)['can_create'])->toBeFalse();
});

it('totals the complete filtered result across pages with exact decimal quantities', function () {
    goodsReceipt($this, true);
    for ($i = 0; $i < 21; $i++) {
        recipientProfileRelease($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '0.125']]]);
    }
    $this->program->update(['is_active' => false]);
    $received = recipientProfileRead($this, $this->filer->id, ['tab' => 'received', 'program_id' => $this->program->id]);
    expect($received['records']['meta']['total'])->toBe(21)->and($received['records']['data'])->toHaveCount(20)
        ->and($received['totals'][0]['quantity'])->toBe('2.625')->and($received['programs'][0]['is_active'])->toBeFalse();
});

it('uses actual handover dates for received filters and creation dates for request filters', function () {
    $this->travelTo(now()->setDate(2026, 10, 9)->startOfDay());
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    $this->travelTo(now()->setDate(2026, 10, 12)->startOfDay());
    goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'actual_release_on' => '2026-10-10']);
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'received', 'from' => '2026-10-10', 'to' => '2026-10-10'])['records']['meta']['total'])->toBe(1);
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'requests', 'from' => '2026-10-10', 'to' => '2026-10-10'])['records']['meta']['total'])->toBe(0);
});

it('keeps program and unit totals separate and does not multiply lines by stock allocations', function () {
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '1', 'program_id' => $this->program->id]]]);
    goodsReceipt($this, true);
    $release = recipientProfileRelease($this);
    expect($release->allocations()->count())->toBe(2);
    $program = Program::create(['municipal_id' => $this->municipalId, 'name' => 'Provincial', 'code' => 'PROV', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $program->id, 'item_id' => $this->item->id, 'is_active' => true]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '10', 'program_id' => $program->id]]]);
    recipientProfileRelease($this, ['program_id' => $program->id]);
    $totals = recipientProfileRead($this, $this->filer->id, ['tab' => 'received'])['totals'];
    expect($totals)->toHaveCount(2)->and(array_column($totals, 'quantity'))->toBe(['2.000', '2.000']);
    $cans = Item::create(['municipal_id' => $this->municipalId, 'name' => 'Sardines', 'code' => 'CANS', 'base_unit' => 'piece', 'is_active' => true]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $cans->id, 'quantity' => '10', 'program_id' => $this->program->id]]]);
    recipientProfileRelease($this, ['lines' => [['item_id' => $cans->id, 'quantity' => '3']]]);
    $totals = recipientProfileRead($this, $this->filer->id, ['tab' => 'received'])['totals'];
    expect($totals)->toHaveCount(3)->and(collect($totals)->firstWhere('item_id', $cans->id)['quantity'])->toBe('3.000')
        ->and(collect($totals)->firstWhere('item_id', $cans->id)['base_unit'])->toBe('piece');
});

it('serves read-only profiles with GD-only permissions and preserves reviewed navigation', function () {
    $request = goodsRequest($this);
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $url = '/inventory-test/goods-distribution/recipients/'.$this->filer->id;
    $response = $this->get($url, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('component', 'GoodsDistribution/RecipientProfile')
        ->assertJsonPath('props.canOpenFullProfile', false)->assertJsonPath('props.canCreate', false)->assertJsonMissingPath('props.records');
    expect($response->json('props.profile'))->not->toHaveKeys(['media', 'contact_phone', 'monthly_income', 'street']);
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $this->get($url, ['X-Inertia' => 'true'])->assertJsonPath('props.canCreate', true)->assertJsonPath('props.profile.identity_verified', false);
    $this->get($url.'?tab=requests&role=filer', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.records.data.0.id', $request->id)->assertJsonMissingPath('props.summary');
    $this->get('/inventory-test/goods-distribution/household-members/'.$this->member->id.'?tab=requests&role=filer')->assertRedirect($url.'?tab=requests&role=filer');
    $this->get($url.'?tab=bad', ['X-Inertia' => 'true'])->assertRedirect();
    $this->actor->givePermissionTo(['action_center.access', 'action_center.beneficiaries.view']);
    $this->get($url, ['X-Inertia' => 'true'])->assertJsonPath('props.canOpenFullProfile', true);
    expect(DistributionRequest::count())->toBe(1)->and(StockMovement::count())->toBe(0);
    goodsInventoryHttp($this, []);
    $this->get($url)->assertForbidden();
});

it('tenant-scopes members beneficiaries history totals and explicit merge groups', function () {
    goodsReceipt($this, true);
    recipientProfileRelease($this);
    $foreignHousehold = Household::create(['municipal_id' => $this->otherMunicipalId, 'household_code' => 'FOREIGN']);
    $foreign = Beneficiary::create(['municipal_id' => $this->otherMunicipalId, 'household_id' => $foreignHousehold->id,
        'first_name' => 'Susan', 'last_name' => 'Solis', 'merged_into_beneficiary_id' => $this->filer->id]);
    $foreignMember = HouseholdMember::create(['household_id' => $foreignHousehold->id, 'first_name' => 'Kenneth']);
    $identity = app(GoodsRecipientIdentityService::class)->resolve($this->municipalId, 'beneficiary', $this->filer->id);
    expect($identity['beneficiary_ids'])->not->toContain($foreign->id);
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    foreach (['recipients/'.$foreign->id, 'household-members/'.$foreignMember->id] as $path) {
        $this->get('/inventory-test/goods-distribution/'.$path)->assertNotFound();
    }
    $this->get('/inventory-test/goods-distribution/recipients/'.$this->filer->id.'?tab=received&program_id='.(string) Str::ulid(), ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonCount(0, 'props.records.data')->assertJsonCount(0, 'props.totals');
});

it('opens unregistered archived members read-only without matching other people by name', function () {
    goodsReceipt($this, true);
    $member = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Susan', 'last_name' => 'Solis', 'relationship' => 'child']);
    recipientProfileRelease($this, ['assisted_household_member_id' => $member->id]);
    $member->update(['is_active' => false]);
    DB::table('ac_household_members')->where('id', $member->id)->update(['deleted_at' => now()]);
    DB::table('ac_households')->where('id', $this->household->id)->update(['deleted_at' => now()]);
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $url = '/inventory-test/goods-distribution/household-members/'.$member->id;
    $this->get($url, ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.canCreate', false)
        ->assertJsonPath('props.canOpenFullProfile', false)->assertJsonPath('props.profile.archived', true)
        ->assertJsonPath('props.profile.identity_verified', null)->assertJsonPath('props.profile.household.is_current', false);
    expect(recipientProfileRead($this, $member->id, ['tab' => 'received'], 'member')['records']['meta']['total'])->toBe(1);
    expect(recipientProfileRead($this, $this->filer->id, ['tab' => 'received'])['records']['meta']['total'])->toBe(0);
});
