<?php

use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\SyncDistributionHouseholdAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\DistributionHouseholdService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
});
afterEach(fn () => goodsDistributionCleanup());

function goodsHouseholdSyncData(DistributionRequest $request, array $changes = []): array
{
    return array_replace(['version' => $request->fresh()->version, 'operation_key' => (string) Str::uuid(),
        'registry_fingerprint' => app(DistributionHouseholdService::class)->preview($request->fresh())['fingerprint'],
        'household_reviewed' => true], $changes);
}

function goodsHouseholdSync(object $test, DistributionRequest $request, ?array $data = null): DistributionRequest
{
    return app(SyncDistributionHouseholdAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id,
        $data ?? goodsHouseholdSyncData($request), $request->id));
}

it('syncs editable stages without changing the filing snapshot goods or stock', function (string $stage) {
    goodsReceipt($this, true);
    $request = goodsRequest($this);
    if ($stage === 'under_review') {
        $request = goodsTransition($this, $request, 'review');
    }
    if ($stage === 'returned') {
        $request = goodsTransition($this, $request, 'return', ['reason' => 'Review household corrections']);
    }
    $filing = $request->filing_snapshot;
    $lines = $request->lines()->get()->toArray();
    $movements = StockMovement::all()->toArray();
    HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    $synced = goodsHouseholdSync($this, $request);
    expect($synced->status->value)->toBe($stage)->and($synced->filing_snapshot)->toBe($filing)
        ->and($synced->reviewed_snapshot['roster'])->toHaveCount(2)->and($synced->lines()->get()->toArray())->toBe($lines)
        ->and($synced->program_id)->toBe($request->program_id)->and($synced->storage_location_id)->toBe($request->storage_location_id)
        ->and(StockMovement::all()->toArray())->toBe($movements)->and(DistributionStockAllocation::count())->toBe(0);
    $audit = DB::table('activity_log')->where('description', 'Synced goods request household')->first();
    $properties = json_decode($audit->properties, true);
    expect($audit->causer_id)->toBe($this->actor->id)->and($properties['before']['snapshot'])->toBe($filing)
        ->and($properties['after']['household_reviewed'])->toBeTrue()->and($properties['after'])->not->toHaveKey('reason');
})->with(['pending', 'returned', 'under_review']);

it('resets inspections for identity changes but retains evidence and frozen requirements', function () {
    $request = goodsTransition($this, goodsRequest($this), 'review');
    DB::table('media')->insert(['id' => 123, 'model_id' => $request->id, 'model_type' => 'gd_distribution_request',
        'collection_name' => 'documents', 'name' => 'Proof', 'file_name' => 'proof.pdf', 'disk' => 'local', 'size' => 100,
        'manipulations' => '[]', 'custom_properties' => '[]', 'generated_conversions' => '[]', 'responsive_images' => '[]']);
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'Original ID',
        'evidence_mode' => 'both', 'physical_copy_requirement' => 'original', 'is_required' => true, 'sort_order' => 0,
        'status' => 'verified', 'current_media_id' => 123, 'inspected_media_id' => 123, 'presented_copy_type' => 'original',
        'checked_at' => now(), 'checked_by_user_id' => $this->actor->id, 'remarks' => 'Inspected in office']);
    $this->member->update(['relationship' => 'parent']);
    goodsHouseholdSync($this, $request);
    $check->refresh();
    expect($check->status)->toBe('pending')->and($check->inspected_media_id)->toBeNull()->and($check->checked_at)->toBeNull()
        ->and($check->checked_by_user_id)->toBeNull()->and($check->current_media_id)->toBe(123)
        ->and($check->label)->toBe('Original ID')->and($check->is_required)->toBeTrue()
        ->and($check->presented_copy_type)->toBe('original')->and($check->remarks)->toBe('Inspected in office');
});

it('does not flag passing time and preserves inspections for address or verification changes', function () {
    $request = goodsRequest($this);
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'proof', 'label' => 'Proof',
        'evidence_mode' => 'physical', 'physical_copy_requirement' => 'original', 'is_required' => true, 'sort_order' => 0,
        'status' => 'verified', 'checked_at' => now(), 'checked_by_user_id' => $this->actor->id]);
    $this->travel(10)->minutes();
    expect(app(DistributionHouseholdService::class)->preview($request)['changed'])->toBeFalse();
    $this->household->update(['street' => 'Updated street']);
    $this->filer->update(['identity_verified_at' => now()]);
    expect(app(DistributionHouseholdService::class)->preview($request)['identity_changed'])->toBeFalse();
    $old = $check->fresh()->toArray();
    goodsHouseholdSync($this, $request);
    expect($check->fresh()->toArray())->toBe($old)->and($request->fresh()->reviewed_snapshot['street'])->toBe('Updated street');
    $this->travelBack();
});

it('rejects stale previews versions and unreviewed changes without partial updates', function (string $case) {
    $request = goodsRequest($this);
    $this->household->update(['street' => 'First correction']);
    $data = goodsHouseholdSyncData($request);
    match ($case) {
        'preview' => $this->household->update(['street' => 'Another correction']),
        'version' => $data['version'] = 0,
        'review' => $data['household_reviewed'] = false,
    };
    expect(fn () => goodsHouseholdSync($this, $request, $data))->toThrow(DomainException::class);
    expect($request->fresh()->version)->toBe(1)->and($request->fresh()->reviewed_snapshot)->toBe($request->filing_snapshot)
        ->and(DB::table('activity_log')->where('description', 'Synced goods request household')->count())->toBe(0);
})->with(['preview', 'version', 'review']);

it('makes identical retries idempotent and rejects conflicting operation keys and unchanged syncs', function () {
    $request = goodsRequest($this);
    expect(fn () => goodsHouseholdSync($this, $request))->toThrow(DomainException::class, 'already up to date');
    $this->household->update(['street' => 'Updated street']);
    $data = goodsHouseholdSyncData($request);
    goodsHouseholdSync($this, $request, $data);
    goodsHouseholdSync($this, $request, $data);
    expect($request->fresh()->version)->toBe(2)
        ->and(DB::table('activity_log')->where('description', 'Synced goods request household')->count())->toBe(1);
    expect(fn () => goodsHouseholdSync($this, $request, [...$data, 'registry_fingerprint' => str_repeat('0', 64)]))->toThrow(DomainException::class);
});

it('retains stable assisted identity and refuses to replace an inactive subject', function () {
    $subject = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    $request = goodsRequest($this, ['assisted_household_member_id' => $subject->id]);
    $subject->update(['is_active' => false]);
    HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    $preview = app(DistributionHouseholdService::class)->preview($request);
    expect($preview['error'])->toContain('active member')->and($preview['snapshot'])->toBeNull();
    expect(fn () => goodsHouseholdSync($this, $request))->toThrow(DomainException::class);
    expect($request->fresh()->reviewed_snapshot['subject']['id'])->toBe($subject->id);
});

it('explicitly reviews a household transfer and preserves the original filing household', function () {
    $request = goodsRequest($this);
    $new = Household::create(['municipal_id' => $this->municipalId, 'household_code' => 'HH-GD-2']);
    $this->member->update(['household_id' => $new->id]);
    $this->filer->update(['household_id' => $new->id]);
    $synced = goodsHouseholdSync($this, $request);
    expect($synced->household_id)->toBe($new->id)->and($synced->reviewed_snapshot['household_id'])->toBe($new->id)
        ->and($synced->filing_snapshot['household_id'])->toBe($this->household->id);
});

it('locks approved and finalized records without changing stock reservations', function (string $stage) {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    if ($stage === 'released') {
        $request = goodsTransition($this, $request, 'release', goodsReleaseData($request));
    }
    if ($stage === 'cancelled') {
        $request = goodsTransition($this, $request, 'cancel', ['reason' => 'Recipient cancelled request']);
    }
    $allocations = $request->allocations()->get()->toArray();
    $movements = StockMovement::all()->toArray();
    $this->household->update(['street' => 'Updated street']);
    expect(fn () => goodsHouseholdSync($this, $request))->toThrow(DomainException::class);
    expect($request->fresh()->status->value)->toBe($stage)->and($request->allocations()->get()->toArray())->toBe($allocations)
        ->and(StockMovement::all()->toArray())->toBe($movements);
})->with(['approved', 'released', 'cancelled']);

it('enforces stage permissions validation municipality isolation and preview scope', function () {
    $request = goodsRequest($this);
    $this->household->update(['street' => 'Updated street']);
    $url = '/api/goods-distribution/requests/'.$request->id.'/sync-household';
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.process']);
    $data = goodsHouseholdSyncData($request);
    $this->postJson($url, $data)->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $this->postJson($url, [])->assertUnprocessable()->assertJsonValidationErrors(['version', 'operation_key', 'registry_fingerprint', 'household_reviewed'])
        ->assertJsonMissingValidationErrors('reason');
    $prefix = '/inventory-test/goods-distribution/distribution/'.$request->id;
    $this->get($prefix.'?tab=household', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.householdSync.changed', true);
    $this->get($prefix.'?tab=goods', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.householdSync', null);
    $this->postJson($url, $data)->assertOk();
    $this->actor->givePermissionTo('goods_distribution.requests.process');
    $request = goodsTransition($this, $request, 'review');
    $this->household->update(['street' => 'Another correction']);
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $this->postJson($url, goodsHouseholdSyncData($request))->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.process']);
    $this->postJson($url, goodsHouseholdSyncData($request))->assertOk();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->postJson($url, goodsHouseholdSyncData($request))->assertNotFound();
});

it('shows a recoverable preview warning for deleted inactive or foreign registry records', function (string $case) {
    $request = goodsRequest($this);
    match ($case) {
        'deleted' => $this->household->delete(),
        'inactive' => $this->filer->update(['is_active' => false]),
        'foreign' => $this->household->update(['municipal_id' => $this->otherMunicipalId]),
    };
    expect(app(DistributionHouseholdService::class)->preview($request)['error'])->toContain('no longer active');
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $this->get('/inventory-test/goods-distribution/distribution/'.$request->id.'?tab=household', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.householdSync.snapshot', null);
})->with(['deleted', 'inactive', 'foreign']);
