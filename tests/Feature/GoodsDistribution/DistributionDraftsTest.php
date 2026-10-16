<?php

use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\SyncDistributionHouseholdAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\DistributionHouseholdService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(function () {
    $this->withoutVite();
    goodsDistributionFixture($this);
});
afterEach(fn () => goodsDistributionCleanup());

function goodsDraft(object $test, array $changes = []): DistributionRequest
{
    return goodsRequest($test, ['intent' => 'draft', 'lines' => [], ...$changes])->refresh();
}

function goodsEditDraft(object $test, DistributionRequest $request, array $changes = []): DistributionRequest
{
    return app(SaveDistributionRequestAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id,
        ['intent' => 'draft', 'version' => $request->fresh()->version, 'beneficiary_id' => $request->beneficiary_id,
            'assisted_household_member_id' => $request->assisted_household_member_id, 'program_id' => $request->program_id,
            'storage_location_id' => $request->storage_location_id, 'notes' => 'Completed at MSWD',
            'lines' => [['item_id' => $test->item->id, 'quantity' => '2']], ...$changes], $request->id));
}

it('saves a shared draft without goods or any stock effect', function () {
    $request = goodsDraft($this);
    expect($request->status->value)->toBe('draft')->and($request->lines()->count())->toBe(0)
        ->and($request->created_by_user_id)->toBe($this->actor->id)
        ->and($request->reviewed_snapshot['filer']['id'])->toBe($this->filer->id)
        ->and(DistributionStockAllocation::count())->toBe(0)->and(StockMovement::count())->toBe(0);
    expect(Activity::where('description', 'Saved goods request draft')->first()->causer_id)->toBe($this->actor->id);
});

it('preserves selected draft items with an unknown quantity as null instead of zero', function () {
    $request = goodsDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => null]]]);
    expect($request->lines()->first()->quantity)->toBeNull();
    expect(fn () => goodsTransition($this, $request, 'submit'))->toThrow(DomainException::class, 'Complete every item quantity');
    expect($request->fresh()->status->value)->toBe('draft')->and($request->fresh()->version)->toBe(1);
    $request = goodsEditDraft($this, $request);
    expect($request->lines()->first()->quantity)->toBe('2.000');
    $request = goodsTransition($this, $request, 'submit');
    expect($request->status->value)->toBe('pending')->and(DistributionStockAllocation::count())->toBe(0);
});

it('keeps drafts out of review approval resubmission and release until submitted', function (string $command) {
    $request = goodsDraft($this);
    expect(fn () => goodsTransition($this, $request, $command, ['recipient_reviewed' => true]))->toThrow(DomainException::class);
    expect($request->fresh()->status->value)->toBe('draft')->and($request->fresh()->version)->toBe(1)
        ->and(DistributionStockAllocation::count())->toBe(0);
})->with(['review', 'approve', 'resubmit', 'release']);

it('retains strict positive and whole-piece quantity rules for known draft amounts', function () {
    foreach (['0', '-1', '0.0001'] as $quantity) {
        expect(fn () => goodsDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => $quantity]]]))->toThrow(DomainException::class);
    }
    $item = Item::create(['municipal_id' => $this->municipalId, 'name' => 'Tuna', 'code' => 'TUNA', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $item->id, 'is_active' => true]);
    expect(fn () => goodsDraft($this, ['lines' => [['item_id' => $item->id, 'quantity' => '1.5']]]))->toThrow(DomainException::class);
    expect(DistributionRequest::count())->toBe(0);
});

it('allows MSWD to complete and submit drafts but not change recipients or edit submitted requests', function () {
    $request = goodsDraft($this);
    $snapshot = $request->reviewed_snapshot;
    $this->actor->revokePermissionTo('goods_distribution.requests.intake');
    expect(fn () => goodsEditDraft($this, $request, ['assisted_household_member_id' => $this->member->id]))->toThrow(AuthorizationException::class);
    expect(fn () => goodsEditDraft($this, $request, ['beneficiary_id' => (string) Str::ulid()]))->toThrow(AuthorizationException::class);
    $request = goodsEditDraft($this, $request);
    expect($request->reviewed_snapshot)->toBe($snapshot)->and($request->lines()->first()->quantity)->toBe('2.000');
    $data = ['operation_key' => 'mswd-submit'];
    $request = goodsTransition($this, $request, 'submit', $data);
    expect($request->status->value)->toBe('pending');
    expect(fn () => goodsEditDraft($this, $request))->toThrow(AuthorizationException::class);
    expect(fn () => goodsDraft($this))->toThrow(AuthorizationException::class);
});

it('requires explicit household sync instead of silently replacing a processor draft snapshot', function () {
    $request = goodsDraft($this);
    $original = $request->reviewed_snapshot;
    $this->actor->revokePermissionTo('goods_distribution.requests.intake');
    $this->household->update(['street' => 'New address']);
    $this->member->update(['relationship' => 'parent']);
    $request = goodsEditDraft($this, $request);
    expect($request->reviewed_snapshot)->toBe($original);
    expect(fn () => goodsTransition($this, $request, 'submit'))->toThrow(DomainException::class, 'identity changed');
    $preview = app(DistributionHouseholdService::class)->preview($request);
    $request = app(SyncDistributionHouseholdAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => $request->version, 'operation_key' => 'draft-sync', 'household_reviewed' => true, 'registry_fingerprint' => $preview['fingerprint']], $request->id));
    expect($request->reviewed_snapshot['street'])->toBe('New address');
    expect(goodsTransition($this, $request, 'submit')->status->value)->toBe('pending');
});

it('submits a completed draft once then follows the existing reserve and release workflow', function () {
    goodsReceipt($this, true);
    $request = goodsEditDraft($this, goodsDraft($this));
    $version = $request->version;
    $data = ['version' => $version, 'operation_key' => 'submit-once'];
    $request = goodsTransition($this, $request, 'submit', $data);
    goodsTransition($this, $request, 'submit', $data);
    expect($request->fresh()->version)->toBe($version + 1)->and(DistributionStockAllocation::count())->toBe(0)
        ->and(Activity::where('description', 'Submit goods request')->count())->toBe(1);
    $request = goodsApproval($this, $request);
    expect(DistributionStockAllocation::where('status', 'reserved')->count())->toBe(1);
    $request = goodsTransition($this, $request, 'release', goodsReleaseData($request));
    expect($request->status->value)->toBe('released')->and(StockMovement::where('type', 'distribution')->count())->toBe(1);
});

it('supports atomic save-and-submit and rejects pending-to-draft changes and stale saves', function () {
    $request = goodsDraft($this);
    $request = goodsEditDraft($this, $request, ['intent' => 'submit']);
    expect($request->status->value)->toBe('pending');
    expect(fn () => goodsEditDraft($this, $request))->toThrow(DomainException::class, 'Only drafts');
    expect(fn () => goodsEditDraft($this, $request, ['intent' => 'save', 'version' => 1]))->toThrow(DomainException::class, 'changed');
    expect($request->fresh()->status->value)->toBe('pending')->and($request->fresh()->version)->toBe(2);
});

it('rejects incomplete direct submissions and revalidates active setup at submission', function () {
    expect(fn () => goodsRequest($this, ['lines' => []]))->toThrow(DomainException::class);
    $request = goodsDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '2']]]);
    $this->programItem->update(['is_active' => false]);
    expect(fn () => goodsTransition($this, $request, 'submit'))->toThrow(DomainException::class, 'no longer enabled');
    expect($request->fresh()->status->value)->toBe('draft')->and($request->fresh()->version)->toBe(1);
});

it('requires a unit change to be reviewed through draft editing before submission', function () {
    $request = goodsDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '2']]]);
    $this->item->update(['base_unit' => 'piece']);
    expect(fn () => goodsTransition($this, $request, 'submit'))->toThrow(DomainException::class, 'item unit changed');
    $request = goodsEditDraft($this, $request);
    expect($request->lines()->first()->base_unit)->toBe('piece');
    expect(goodsTransition($this, $request, 'submit')->status->value)->toBe('pending');
});

it('makes draft creation idempotent and rejects conflicting submissions', function () {
    $data = distributionData($this, ['intent' => 'draft', 'lines' => []]);
    $action = app(SaveDistributionRequestAction::class);
    $dto = new DistributionRequestDto($this->municipalId, $this->actor->id, $data);
    $a = $action->execute($dto);
    $b = $action->execute($dto);
    expect($a->id)->toBe($b->id)->and(DistributionRequest::count())->toBe(1);
    expect(fn () => $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, [...$data, 'intent' => 'submit'])))
        ->toThrow(DomainException::class, 'Submission key');
});

it('enforces draft API and page permissions validation tenant isolation and shared visibility', function () {
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    $base = '/api/goods-distribution/requests';
    $data = distributionData($this, ['intent' => 'draft', 'lines' => []]);
    $this->postJson($base, $data)->assertOk();
    $request = DistributionRequest::first();
    $page = '/inventory-test/goods-distribution/distribution/'.$request->id;
    $this->get('/inventory-test/goods-distribution/distribution?status=draft', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.records.data.0.status', 'draft');
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.process']);
    $this->get($page.'/edit', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.permissions.intake', false);
    $this->postJson($base, [...$data, 'submission_key' => (string) Str::uuid()])->assertForbidden();
    $this->postJson($base.'/'.$request->id.'/submit', ['version' => 1, 'operation_key' => 'empty'])->assertUnprocessable();
    $update = [...$data, 'version' => 1, 'lines' => [['item_id' => $this->item->id, 'quantity' => null]]];
    $this->patchJson($base.'/'.$request->id, $update)->assertOk();
    $this->patchJson($base.'/'.$request->id, [...$update, 'version' => 2, 'intent' => 'submit'])->assertUnprocessable()->assertJsonValidationErrors('lines.0.quantity');
    $this->patchJson($base.'/'.$request->id, [...$update, 'version' => 2, 'intent' => 'submit', 'lines' => [['item_id' => $this->item->id, 'quantity' => '2']]])->assertOk();
    $this->get($page.'/edit')->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view']);
    $this->patchJson($base.'/'.$request->id, [...$update, 'version' => 3])->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.requests.view', 'goods_distribution.requests.intake']);
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->patchJson($base.'/'.$request->id, [...$update, 'version' => 3])->assertNotFound();
});
