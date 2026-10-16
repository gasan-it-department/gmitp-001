<?php

use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReconcileBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\TransitionBulkDispatchAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\BulkDispatchReconciliation;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';

beforeEach(function () {
    $this->withoutVite();
    bulkFixture($this);
    goodsReceipt($this, true);
});
afterEach(fn () => goodsDistributionCleanup());

it('completes the 250 to 100 to 80 and 20 example without beneficiary requests or double deduction', function () {
    $dispatch = bulkDraft($this);
    $batch = $this->item->receiptLines()->first();
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(0);
    $dispatch = bulkApprove($this, $dispatch);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(250000)->and(app(StockLedgerService::class)->reserved($batch))->toBe(100000);
    $dispatch = bulkDepart($this, $dispatch);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(150000)->and(app(StockLedgerService::class)->reserved($batch))->toBe(0);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '80']]);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(150000)->and(StockMovement::count())->toBe(2);
    $id = $dispatch->allocations()->where('status', 'issued')->first()->id;
    $dispatch = bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $id, 'quantity' => '20']]);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(170000);
    $dispatch = bulkCommand($this, $dispatch, 'close');
    expect($dispatch->status->value)->toBe('closed')->and(DistributionRequest::count())->toBe(0)
        ->and(DB::table('gd_distribution_cooldowns')->count())->toBe(0);
    $row = app(ReadGoodsInventoryAction::class)->inventory($this->municipalId, new InventoryFiltersDto)->first();
    expect((string) $row->with_staff)->toBe('0.000')->and((string) $row->reported_distributed)->toBe('80.000')->and((string) $row->returned)->toBe('20.000');
});

it('uses FEFO before undated batches and requires review when proposed batches change', function () {
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '25', 'expires_on' => today()->addMonth()->toDateString()]]]);
    $dispatch = bulkDraft($this);
    $preview = app(BulkDispatchAllocationService::class)->approvalPreview($dispatch);
    expect($preview['allocations'][0]['quantity'])->toBe('25.000')->and($preview['allocations'][1]['quantity'])->toBe('75.000');
    $batch = \App\Core\GoodsDistribution\Models\StockReceiptLine::find($preview['allocations'][0]['batch_id']);
    app(AdjustStockAction::class)->execute($batch->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged stock count', 'COUNT', '5', 'remove'));
    expect(fn () => bulkCommand($this, $dispatch, 'approve', ['fingerprint' => $preview['fingerprint']]))->toThrow(DomainException::class, 'review changed');
    expect($dispatch->allocations()->count())->toBe(0);
});

it('shares reservations with individual requests and prevents adjustments from removing bulk reservations', function () {
    $dispatch = bulkApprove($this, bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '249']]]));
    expect(fn () => goodsApproval($this, goodsRequest($this)))->toThrow(DomainException::class, 'Insufficient');
    $batch = $this->item->receiptLines()->first();
    expect(fn () => app(AdjustStockAction::class)->execute($batch->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged stock count', 'COUNT', '2', 'remove')))->toThrow(DomainException::class);
    bulkCommand($this, $dispatch, 'withdraw', ['reason' => 'Review the requested quantities']);
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(0);
    expect(goodsApproval($this, goodsRequest($this))->status->value)->toBe('approved');
});

it('keeps incomplete drafts and old lines while blocking incomplete approval', function () {
    $dispatch = bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => null]]]);
    expect(fn () => bulkApprove($this, $dispatch))->toThrow(DomainException::class);
    $data = [...bulkData($this), 'version' => 1, 'operation_key' => (string) Str::uuid()];
    $dispatch = app(SaveBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, $data, $dispatch->id));
    expect($dispatch->allLines()->count())->toBe(2)->and($dispatch->lines()->count())->toBe(1);
    expect(bulkApprove($this, $dispatch)->status->value)->toBe('approved');
});

it('supports school distributions handled by municipal staff or an external representative', function () {
    foreach (['staff' => 'Municipal / LGU staff', 'other_representative' => 'Other representative'] as $type => $label) {
        $dispatch = bulkDraft($this, ['custodian_type' => $type, 'custodian_name' => 'Maria Reyes',
            'custodian_role' => $type === 'staff' ? 'LGU distribution team leader' : 'School principal',
            'requester_name' => null, 'requester_role' => null, 'purpose' => 'school_distribution',
            'purpose_notes' => 'Food packs for students', 'location_notes' => 'Gasan Central School']);
        $dispatch = bulkApprove($this, $dispatch);
        expect($dispatch->status->value)->toBe('approved')->and($dispatch->approval_snapshot['custodian_type_label'])->toBe($label)
            ->and($dispatch->approval_snapshot['purpose_label'])->toBe('School distribution')
            ->and($dispatch->approval_snapshot['purpose_notes'])->toBe('Food packs for students')
            ->and($dispatch->approval_snapshot['location_notes'])->toBe('Gasan Central School')
            ->and($dispatch->requester_name)->toBeNull()->and($dispatch->requester_role)->toBeNull();
        if ($type === 'other_representative') {
            $dispatch = bulkDepart($this, $dispatch);
            expect(fn () => $dispatch->update(['purpose_notes' => 'Changed after departure']))->toThrow(DomainException::class, 'permanent');
        }
    }
});

it('allows incomplete purpose drafts but requires purpose details and school venue before approval', function () {
    $missing = bulkDraft($this, ['purpose' => null, 'purpose_notes' => null]);
    expect($missing->purpose)->toBeNull();
    expect(fn () => bulkApprove($this, $missing))->toThrow(DomainException::class, 'purpose');
    $other = bulkDraft($this, ['purpose' => 'other', 'purpose_notes' => null]);
    expect(fn () => bulkApprove($this, $other))->toThrow(DomainException::class, 'Describe the purpose');
    $school = bulkDraft($this, ['purpose' => 'school_distribution', 'location_notes' => null]);
    expect(fn () => bulkApprove($this, $school))->toThrow(DomainException::class, 'school name');
    $data = [...bulkData($this, ['purpose' => 'other', 'purpose_notes' => 'Municipal community activity']),
        'version' => $other->version, 'operation_key' => (string) Str::uuid()];
    $other = app(SaveBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, $data, $other->id));
    expect(bulkApprove($this, $other)->status->value)->toBe('approved');
});

it('rejects invalid categories and requires an actual custodian before approval', function () {
    expect(fn () => bulkDraft($this, ['custodian_type' => 'school']))->toThrow(DomainException::class, 'custodian type');
    expect(fn () => bulkDraft($this, ['purpose' => 'Unlisted activity']))->toThrow(DomainException::class, 'purpose');
    expect(fn () => bulkDraft($this, ['custodian_type' => 'other_representative', 'custodian_user_id' => $this->actor->id]))
        ->toThrow(DomainException::class, 'Only staff');
    foreach (['None', 'N/A'] as $name) {
        $draft = bulkDraft($this, ['custodian_name' => $name]);
        expect(fn () => bulkApprove($this, $draft))->toThrow(DomainException::class, 'actual responsible custodian');
    }
});

it('does not permit closure or cancellation of outstanding dispatched goods', function () {
    $dispatch = bulkDepart($this);
    expect(fn () => bulkCommand($this, $dispatch, 'close'))->toThrow(DomainException::class, 'Reconcile');
    expect(fn () => bulkCommand($this, $dispatch, 'cancel', ['reason' => 'Cancelled after departure']))->toThrow(DomainException::class);
    expect(fn () => bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '101']]))->toThrow(DomainException::class);
});

it('keeps a fully issued item visible in inventory while stock is with staff', function () {
    $dispatch = bulkDepart($this, bulkApprove($this, bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '250']]])));
    $item = app(ReadGoodsInventoryAction::class)->inventory($this->municipalId, new InventoryFiltersDto)->first();
    expect((string) $item->balance)->toBe('0.000')->and((string) $item->with_staff)->toBe('250.000')
        ->and($dispatch->status->value)->toBe('dispatched');
});

it('requires usable return confirmation and respects outstanding batch quantities', function () {
    $dispatch = bulkDepart($this);
    $id = $dispatch->allocations()->first()->id;
    expect(fn () => bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $id, 'quantity' => '10']], ['usable_confirmed' => false]))->toThrow(DomainException::class, 'fit for distribution');
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '90']]);
    expect(fn () => bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $id, 'quantity' => '11']]))->toThrow(DomainException::class);
    expect(BulkDispatchReconciliation::count())->toBe(1)->and(StockMovement::count())->toBe(2);
});

it('preserves reconciliation history through reopening and exact reversals', function () {
    $dispatch = bulkDepart($this);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '100']]);
    $event = $dispatch->reconciliations()->first();
    $dispatch = bulkCommand($this, $dispatch, 'close');
    $data = ['version' => $dispatch->version, 'operation_key' => (string) Str::uuid(), 'reconciliation_id' => $event->id, 'reason' => 'Wrong distributed quantity recorded'];
    expect(fn () => app(ReconcileBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, $data, $dispatch->id), true))->toThrow(DomainException::class, 'Reopen');
    $dispatch = bulkCommand($this, $dispatch, 'reopen', ['reason' => 'Review the distributed totals']);
    app(ReconcileBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, [...$data, 'version' => $dispatch->version], $dispatch->id), true);
    expect(BulkDispatchReconciliation::count())->toBe(2)->and(StockMovement::count())->toBe(2);
    expect(array_values(app(BulkDispatchAllocationService::class)->balances($dispatch))[0]['with_staff'])->toBe('100.000');
    expect(fn () => $event->delete())->toThrow(DomainException::class);
});

it('makes create approval departure and reconciliation retries idempotent', function () {
    $data = bulkData($this);
    $action = app(SaveBulkDispatchAction::class);
    $dto = new BulkDispatchDto($this->municipalId, $this->actor->id, $data);
    $dispatch = $action->execute($dto);
    expect($action->execute($dto)->id)->toBe($dispatch->id)->and(BulkDispatch::count())->toBe(1);
    $preview = app(BulkDispatchAllocationService::class)->approvalPreview($dispatch);
    $approval = new BulkDispatchDto($this->municipalId, $this->actor->id, ['version' => 1, 'operation_key' => 'approve-once', 'fingerprint' => $preview['fingerprint']], $dispatch->id);
    $transition = app(TransitionBulkDispatchAction::class);
    $dispatch = $transition->execute($approval, 'approve');
    $transition->execute($approval, 'approve');
    $departure = new BulkDispatchDto($this->municipalId, $this->actor->id, ['version' => $dispatch->version, 'operation_key' => 'depart-once', 'actual_on' => today()->toDateString(),
        'custodian_acknowledged' => true, 'confirmed_allocation_ids' => $dispatch->allocations()->pluck('id')->all()], $dispatch->id);
    $dispatch = $transition->execute($departure, 'dispatch');
    $transition->execute($departure, 'dispatch');
    expect($dispatch->allocations()->count())->toBe(1)->and(StockMovement::count())->toBe(2);
    expect(fn () => $action->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, [...$data, 'purpose' => 'emergency_relief'])))->toThrow(DomainException::class);
});

it('excludes unrelated tenants and honors bulk permissions independently of AC', function () {
    $this->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view', 'goods_distribution.bulk_dispatches.prepare']);
    $dispatch = bulkDraft($this);
    expect($this->actor->can('action_center.access'))->toBeFalse();
    expect(fn () => bulkApprove($this, $dispatch))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
    expect(fn () => app(SaveBulkDispatchAction::class)->execute(new BulkDispatchDto($this->otherMunicipalId, $this->actor->id, bulkData($this))))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
});

it('reconciles multiple batches exactly and rejects fractional counted goods', function () {
    $cans = Item::create(['municipal_id' => $this->municipalId, 'code' => 'CANS', 'name' => 'Tuna cans', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $cans->id, 'is_active' => true]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '25', 'expires_on' => today()->addMonth()->toDateString()],
        ['item_id' => $cans->id, 'program_id' => $this->program->id, 'quantity' => '8']]]);
    $dispatch = bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '30.125'], ['item_id' => $cans->id, 'quantity' => '3']]]);
    $dispatch = bulkDepart($this, bulkApprove($this, $dispatch));
    $allocations = $dispatch->allocations()->with('line')->get();
    expect($allocations)->toHaveCount(3);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '27.125'], ['item_id' => $cans->id, 'quantity' => '3']]);
    $left = app(BulkDispatchAllocationService::class)->balances($dispatch);
    $remainingBatch = collect($left)->first(fn ($row) => $row['item_id'] === $this->item->id && $row['with_staff'] === '3.000');
    $dispatch = bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $remainingBatch['id'], 'quantity' => '3']]);
    expect(bulkCommand($this, $dispatch, 'close')->status->value)->toBe('closed');
    expect(fn () => bulkDraft($this, ['lines' => [['item_id' => $cans->id, 'quantity' => '1.5']]]))->toThrow(DomainException::class);
});

it('does not reverse a returned batch after its stock is reserved for another request', function () {
    $dispatch = bulkDepart($this, bulkApprove($this, bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '250']]])));
    $allocation = $dispatch->allocations()->first();
    $dispatch = bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $allocation->id, 'quantity' => '20']]);
    $returnEvent = $dispatch->reconciliations()->first();
    goodsApproval($this, goodsRequest($this));
    $reversal = ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(),
        'reconciliation_id' => $returnEvent->id, 'reason' => 'Recorded wrong unused return amount'];
    expect(fn () => app(ReconcileBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id, $reversal, $dispatch->id), true))
        ->toThrow(DomainException::class, 'already consumed or reserved');
    expect($dispatch->reconciliations()->count())->toBe(1)->and(StockMovement::where('type', 'reversal')->count())->toBe(0);
});

it('uses actual dates for approved batches while excluding expired stock from new approval', function () {
    $originalTime = now();
    try {
        \Illuminate\Support\Carbon::setTestNow('2026-10-09 09:00:00');
        $receipt = goodsReceipt($this, true, ['received_on' => '2026-10-09', 'lines' => [['item_id' => $this->item->id,
            'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => '2026-10-10']]]);
        $dispatch = bulkApprove($this, bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '10']]]));
        \Illuminate\Support\Carbon::setTestNow('2026-10-12 09:00:00');
        $dispatch = bulkCommand($this, $dispatch, 'dispatch', ['actual_on' => '2026-10-09', 'custodian_acknowledged' => true,
            'confirmed_allocation_ids' => $dispatch->allocations()->pluck('id')->all()]);
        expect($dispatch->status->value)->toBe('dispatched');
        expect(fn () => bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $dispatch->allocations()->first()->id, 'quantity' => '10']], ['actual_on' => '2026-10-12']))
            ->toThrow(DomainException::class);
        expect(fn () => bulkApprove($this, bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '1']]])))
            ->toThrow(DomainException::class, 'Insufficient');
        expect($receipt->lines->first()->expires_on->toDateString())->toBe('2026-10-10');
    } finally {
        \Illuminate\Support\Carbon::setTestNow($originalTime);
    }
});
