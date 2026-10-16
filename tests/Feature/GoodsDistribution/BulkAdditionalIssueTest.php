<?php

use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ManageBulkAdditionalIssueAction;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchRecipientAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Dto\BulkDispatchRecipientDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Models\BulkDispatchAdditionalIssue;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchRecipientService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';

beforeEach(function () {
    $this->withoutVite();
    $this->travelTo(\Carbon\Carbon::parse('2026-10-15 10:00:00'));
    bulkFixture($this);
    goodsReceipt($this, true);
});
afterEach(function () {
    goodsDistributionCleanup();
    $this->travelBack();
});

function extraCommand(object $test, $dispatch, string $command, $issue = null, array $changes = [])
{
    $data = ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), ...$changes];
    if ($command === 'create') {
        $data = ['reason' => 'Additional households arrived at the venue', 'lines' => [['item_id' => $test->item->id, 'quantity' => '20']], ...$data];
    }
    if ($command === 'approve' && ! isset($data['fingerprint'])) {
        $data['fingerprint'] = app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue->fresh())['fingerprint'];
    }
    if ($command === 'issue') {
        $data = ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
            'confirmed_allocation_ids' => $issue->allocations()->where('status', 'reserved')->pluck('id')->sort()->values()->all(), ...$data];
    }

    return app(ManageBulkAdditionalIssueAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id, $data, $dispatch->id), $command, $issue?->id);
}

it('adds 20 to an original 100 without rewriting the issue and reconciles all 120', function () {
    $dispatch = bulkDepart($this);
    $original = $dispatch->only(['approval_revision', 'approval_snapshot', 'actual_dispatch_on', 'dispatched_at']);
    $batch = $this->item->receiptLines()->first();
    $issue = extraCommand($this, $dispatch, 'create');
    expect($issue->status->value)->toBe('pending')->and(app(StockLedgerService::class)->reserved($batch))->toBe(0);
    $issue = extraCommand($this, $dispatch, 'approve', $issue);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(150000)->and(app(StockLedgerService::class)->reserved($batch))->toBe(20000);
    $issue = extraCommand($this, $dispatch, 'issue', $issue);
    expect($issue->status->value)->toBe('issued')->and(app(StockLedgerService::class)->balance($batch))->toBe(130000)
        ->and(app(StockLedgerService::class)->reserved($batch))->toBe(0)->and($dispatch->fresh()->lines()->count())->toBe(1)
        ->and($dispatch->fresh()->lines()->first()->quantity)->toBe('100.000')->and($dispatch->fresh()->only(array_keys($original)))->toEqual($original);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '110']]);
    $row = collect(app(BulkDispatchAllocationService::class)->balances($dispatch))->firstWhere('with_staff', '10.000');
    $dispatch = bulkReconcile($this, $dispatch, 'return', [['allocation_id' => $row['id'], 'quantity' => '10']]);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(140000)
        ->and(bulkCommand($this, $dispatch, 'close')->status->value)->toBe('closed')
        ->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(2);
    $coverage = app(BulkDispatchRecipientService::class)->coverage($dispatch);
    expect($coverage[0]['reported_distributed'])->toBe('110.000');
    $person = app(SaveBulkDispatchRecipientAction::class)->execute(new BulkDispatchRecipientDto($this->municipalId, $this->actor->id, $dispatch->id,
        ['version' => $dispatch->fresh()->version, 'submission_key' => (string) Str::uuid(), 'first_name' => 'Juan', 'last_name' => 'Reyes',
            'lines' => [['bulk_dispatch_line_id' => $coverage[0]['bulk_dispatch_line_id'], 'quantity' => '110']]]), 'create');
    expect($person->lines()->first()->quantity)->toBe('110.000')->and(app(StockLedgerService::class)->balance($batch))->toBe(140000);
});

it('supports newly added goods and multiple extra pickups while retaining frozen original quantities', function () {
    $cans = Item::create(['municipal_id' => $this->municipalId, 'code' => 'TUNA', 'name' => 'Tuna cans', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $cans->id, 'is_active' => true]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $cans->id, 'program_id' => $this->program->id, 'quantity' => '50']]]);
    $dispatch = bulkDepart($this);
    foreach (['5', '10'] as $quantity) {
        $issue = extraCommand($this, $dispatch, 'create', changes: ['lines' => [['item_id' => $cans->id, 'quantity' => $quantity]]]);
        $issue = extraCommand($this, $dispatch, 'approve', $issue);
        extraCommand($this, $dispatch, 'issue', $issue);
    }
    expect($dispatch->fresh()->lines()->count())->toBe(2)->and($dispatch->lines()->where('item_id', $cans->id)->first()->quantity)->toBeNull()
        ->and(app(StockLedgerService::class)->balance($cans->receiptLines()->first()))->toBe(35000)
        ->and($dispatch->fresh()->approval_snapshot['lines'])->toHaveCount(1);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $cans->id, 'quantity' => '15']]);
    $coverage = collect(app(BulkDispatchRecipientService::class)->coverage($dispatch))->firstWhere('item_id', $cans->id);
    expect($coverage['reported_distributed'])->toBe('15.000');
});

it('requires complete quantities reason and program enabled active items', function () {
    $dispatch = bulkDepart($this);
    foreach ([['reason' => '   '], ['lines' => []], ['lines' => [['item_id' => $this->item->id, 'quantity' => '0']]],
        ['lines' => [['item_id' => $this->item->id, 'quantity' => '1.0001']]],
        ['lines' => [['item_id' => $this->item->id, 'quantity' => '1'], ['item_id' => $this->item->id, 'quantity' => '2']]]] as $data) {
        expect(fn () => extraCommand($this, $dispatch, 'create', changes: $data))->toThrow(DomainException::class);
    }
    ProgramItem::where('item_id', $this->item->id)->update(['is_active' => false]);
    expect(fn () => extraCommand($this, $dispatch, 'create'))->toThrow(DomainException::class, 'enabled');
    expect(BulkDispatchAdditionalIssue::count())->toBe(0);
});

it('rejects fractional pieces and stale reviews and rolls back incomplete approvals', function () {
    $dispatch = bulkDepart($this);
    $cans = Item::create(['municipal_id' => $this->municipalId, 'code' => 'TUNA', 'name' => 'Tuna cans', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $cans->id, 'is_active' => true]);
    expect(fn () => extraCommand($this, $dispatch, 'create', changes: ['lines' => [['item_id' => $cans->id, 'quantity' => '1.5']]]))->toThrow(DomainException::class);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => today()->addMonth()->toDateString()]]]);
    $issue = extraCommand($this, $dispatch, 'create');
    $preview = app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue);
    $batch = $this->item->receiptLines()->whereNotNull('expires_on')->first();
    app(AdjustStockAction::class)->execute($batch->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged stock count', 'COUNT', '5', 'remove'));
    expect(fn () => extraCommand($this, $dispatch, 'approve', $issue, ['fingerprint' => $preview['fingerprint']]))->toThrow(DomainException::class, 'review changed');
    expect($issue->allocations()->count())->toBe(0)->and($issue->fresh()->status->value)->toBe('pending');
    $tooMuch = extraCommand($this, $dispatch, 'create', changes: ['lines' => [['item_id' => $this->item->id, 'quantity' => '999']]]);
    expect(fn () => extraCommand($this, $dispatch, 'approve', $tooMuch))->toThrow(DomainException::class, 'Insufficient');
});

it('shares additional reservations with adjustments and releases only its own reservations on cancellation', function () {
    $dispatch = bulkDepart($this);
    $first = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    $second = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    $batch = $this->item->receiptLines()->first();
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(40000);
    expect(fn () => app(AdjustStockAction::class)->execute($batch->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged stock count', 'COUNT', '111', 'remove')))->toThrow(DomainException::class);
    extraCommand($this, $dispatch, 'cancel', $first, ['reason' => 'Additional pickup no longer needed']);
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(20000)->and($second->fresh()->status->value)->toBe('approved');
    extraCommand($this, $dispatch, 'issue', $second);
    expect(app(StockLedgerService::class)->balance($batch))->toBe(130000)->and(app(StockLedgerService::class)->reserved($batch))->toBe(0);
    expect(fn () => extraCommand($this, $dispatch, 'cancel', $second, ['reason' => 'Cancel already collected goods']))->toThrow(DomainException::class, 'unused returns');
});

it('blocks closure for pending additions even after the original issue is reconciled', function () {
    $dispatch = bulkDepart($this);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '100']]);
    $issue = extraCommand($this, $dispatch, 'create');
    expect(fn () => bulkCommand($this, $dispatch, 'close'))->toThrow(DomainException::class, 'additional issue');
    extraCommand($this, $dispatch, 'cancel', $issue, ['reason' => 'No further quantities are needed']);
    $dispatch = bulkCommand($this, $dispatch, 'close');
    expect(fn () => extraCommand($this, $dispatch, 'create'))->toThrow(DomainException::class, 'active dispatched');
    expect(fn () => extraCommand($this, bulkDraft($this), 'create'))->toThrow(DomainException::class, 'active dispatched');
});

it('requires exact physical batches acknowledgement and valid actual pickup dates', function () {
    $dispatch = bulkDepart($this);
    $issue = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    foreach ([['confirmed_allocation_ids' => []], ['custodian_acknowledged' => false], ['actual_on' => today()->subDay()->toDateString()], ['actual_on' => today()->addDay()->toDateString()]] as $data) {
        expect(fn () => extraCommand($this, $dispatch, 'issue', $issue, $data))->toThrow(DomainException::class);
    }
    expect($issue->fresh()->status->value)->toBe('approved')->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(1);
});

it('does not use later pickups for backdated reports and checks expiry against actual pickup date', function () {
    $this->travelTo(now()->setDate(2026, 10, 15));
    $dispatch = bulkDepart($this);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '20', 'expires_on' => '2026-10-16']]]);
    $issue = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    $this->travelTo(now()->setDate(2026, 10, 18));
    expect(fn () => extraCommand($this, $dispatch, 'issue', $issue))->toThrow(DomainException::class, 'expired');
    extraCommand($this, $dispatch, 'issue', $issue, ['actual_on' => '2026-10-16']);
    expect(fn () => bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '120']], ['actual_on' => '2026-10-15']))->toThrow(DomainException::class, 'remaining');
    bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '120']], ['actual_on' => '2026-10-16']);
    expect(StockMovement::where('type', 'bulk_dispatch')->orderByDesc('occurred_on')->first()->occurred_on->toDateString())->toBe('2026-10-16');
    $this->travelBack();
});

it('allocates fractional kilograms in FEFO order and counts an extra pickup across batches once', function () {
    $dispatch = bulkDepart($this);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => '2026-11-01']]]);
    $issue = extraCommand($this, $dispatch, 'create', changes: ['lines' => [['item_id' => $this->item->id, 'quantity' => '20.125']]]);
    $preview = app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue);
    expect(array_column($preview['allocations'], 'quantity'))->toBe(['10.000', '10.125'])
        ->and($preview['allocations'][0]['expires_on'])->toBe('2026-11-01')->and($preview['allocations'][1]['expires_on'])->toBeNull();
    $issue = extraCommand($this, $dispatch, 'approve', $issue);
    extraCommand($this, $dispatch, 'issue', $issue);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '120.125']]);
    expect(app(BulkDispatchRecipientService::class)->coverage($dispatch)[0]['reported_distributed'])->toBe('120.125')
        ->and(bulkCommand($this, $dispatch, 'close')->status->value)->toBe('closed');
});

it('enforces the tenant aware allocation link at database level', function () {
    $dispatch = bulkDepart($this);
    $issue = extraCommand($this, $dispatch, 'create');
    $other = bulkDraft($this);
    expect(fn () => DB::transaction(fn () => \App\Core\GoodsDistribution\Models\BulkDispatchStockAllocation::create([
        'municipal_id' => $this->municipalId, 'bulk_dispatch_id' => $other->id, 'bulk_dispatch_line_id' => $other->lines()->first()->id,
        'stock_receipt_line_id' => $this->item->receiptLines()->first()->id, 'base_unit' => 'kg', 'quantity' => '20.000',
        'approval_revision' => 1, 'additional_issue_id' => $issue->id,
    ])))->toThrow(\Illuminate\Database\QueryException::class);
    expect($other->allocations()->count())->toBe(0);
});

it('rolls back every deduction when a later reserved batch fails physical pickup validation', function () {
    $dispatch = bulkDepart($this);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => '2026-11-01']]]);
    $issue = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    $rows = $issue->allocations()->orderBy('id')->get();
    expect($rows)->toHaveCount(2);
    DB::table('gd_stock_receipt_lines')->where('id', $rows->last()->stock_receipt_line_id)->update(['expires_on' => '2026-10-14']);
    expect(fn () => extraCommand($this, $dispatch, 'issue', $issue))->toThrow(DomainException::class, 'expired');
    expect($issue->fresh()->status->value)->toBe('approved')->and($issue->allocations()->where('status', 'reserved')->count())->toBe(2)
        ->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(1);
});

it('makes create approval pickup and cancellation retries idempotent and rejects changed keys', function () {
    $dispatch = bulkDepart($this);
    $key = (string) Str::uuid();
    $version = $dispatch->version;
    $issue = extraCommand($this, $dispatch, 'create', changes: ['operation_key' => $key, 'version' => $version]);
    expect(extraCommand($this, $dispatch, 'create', changes: ['operation_key' => $key, 'version' => $version])->id)->toBe($issue->id);
    expect(fn () => extraCommand($this, $dispatch, 'create', changes: ['operation_key' => $key, 'version' => $version, 'reason' => 'Different quantity requirements']))->toThrow(DomainException::class, 'different');
    $data = ['operation_key' => (string) Str::uuid(), 'version' => $dispatch->fresh()->version,
        'fingerprint' => app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue)['fingerprint']];
    extraCommand($this, $dispatch, 'approve', $issue, $data);
    extraCommand($this, $dispatch, 'approve', $issue, $data);
    $data = ['operation_key' => (string) Str::uuid(), 'version' => $dispatch->fresh()->version, 'confirmed_allocation_ids' => $issue->allocations()->pluck('id')->all()];
    extraCommand($this, $dispatch, 'issue', $issue, $data);
    extraCommand($this, $dispatch, 'issue', $issue, $data);
    expect($issue->allocations()->count())->toBe(1)->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(2);
    $other = extraCommand($this, $dispatch, 'create');
    $data = ['operation_key' => (string) Str::uuid(), 'version' => $dispatch->fresh()->version, 'reason' => 'Duplicate quantity not needed'];
    extraCommand($this, $dispatch, 'cancel', $other, $data);
    expect(extraCommand($this, $dispatch, 'cancel', $other, $data)->status->value)->toBe('cancelled');
});

it('guards stale parent versions cross tenant access and role capabilities', function () {
    $dispatch = bulkDepart($this);
    expect(fn () => extraCommand($this, $dispatch, 'create', changes: ['version' => 1]))->toThrow(DomainException::class, 'Refresh');
    $issue = extraCommand($this, $dispatch, 'create');
    $this->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view', 'goods_distribution.bulk_dispatches.prepare']);
    expect(fn () => extraCommand($this, $dispatch, 'approve', $issue))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
    expect(fn () => app(ManageBulkAdditionalIssueAction::class)->execute(new BulkDispatchDto($this->otherMunicipalId, $this->actor->id,
        ['operation_key' => (string) Str::uuid()], $dispatch->id), 'create'))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    expect(DB::table('gd_bulk_dispatch_additional_issues')->count())->toBe(1);
});

it('exposes the additional issue flow over HTTP with permission protected commands', function () {
    goodsInventoryHttp($this, collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])->map(fn ($capability) => 'goods_distribution.bulk_dispatches.'.$capability)->all());
    $dispatch = bulkDepart($this);
    $base = '/api/goods-distribution/bulk-dispatches/'.$dispatch->id.'/additional-issues';
    $this->postJson($base, ['version' => $dispatch->version, 'operation_key' => (string) Str::uuid(), 'reason' => 'Additional rice for households',
        'lines' => [['item_id' => $this->item->id, 'quantity' => '20']]])->assertOk();
    $issue = BulkDispatchAdditionalIssue::first();
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id, ['X-Inertia' => 'true'])->assertOk()
        ->assertJsonPath('props.additionalIssuesReady', true)->assertJsonPath('props.additionalIssues.data.0.id', $issue->id)
        ->assertJsonPath('props.hasPendingAdditionalIssues', true);
    $preview = $this->postJson($base.'/'.$issue->id.'/preview', ['version' => $dispatch->fresh()->version])->assertOk()->json('data');
    $this->postJson($base.'/'.$issue->id.'/approve', ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), 'fingerprint' => $preview['fingerprint']])->assertOk();
    $this->postJson($base.'/'.$issue->id.'/issue', ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(),
        'actual_on' => today()->toDateString(), 'custodian_acknowledged' => true, 'confirmed_allocation_ids' => $issue->allocations()->pluck('id')->all()])->assertOk();
    $this->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view']);
    $this->postJson($base, [])->assertForbidden();
});

it('keeps existing bulk pages and operations usable before the additional issue migration', function () {
    goodsInventoryHttp($this, collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])->map(fn ($capability) => 'goods_distribution.bulk_dispatches.'.$capability)->all());
    $migration = require database_path('migrations/2026_10_15_000001_create_gd_bulk_dispatch_additional_issues_table.php');
    $migration->down();
    try {
        $dispatch = bulkDepart($this);
        $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id, ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('props.additionalIssuesReady', false);
        $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $this->item->id, 'quantity' => '100']]);
        expect(bulkCommand($this, $dispatch, 'close')->status->value)->toBe('closed');
    } finally {
        $migration->up();
    }
});

it('keeps pickup dates date only in new audits and displays older UTC audit dates in Philippine time', function () {
    goodsInventoryHttp($this, collect(['view', 'prepare', 'approve', 'dispatch', 'reconcile', 'correct'])->map(fn ($capability) => 'goods_distribution.bulk_dispatches.'.$capability)->all());
    $dispatch = bulkDepart($this);
    $issue = extraCommand($this, $dispatch, 'approve', extraCommand($this, $dispatch, 'create'));
    $issue = extraCommand($this, $dispatch, 'issue', $issue);
    expect($issue->toArray()['actual_issue_on'])->toBe('2026-10-15');
    $event = \Spatie\Activitylog\Models\Activity::query()->where('subject_id', $dispatch->id)->where('description', 'Issue bulk additional issue')->firstOrFail();
    expect($event->properties['after']['additional_issue']['actual_issue_on'])->toBe('2026-10-15');
    $properties = $event->properties->toArray();
    $properties['after']['additional_issue']['actual_issue_on'] = '2026-10-14T16:00:00.000000Z';
    $properties['before']['additional_issue']['actual_issue_on'] = '2026-10-14T16:00:00.000000Z';
    $event->update(['properties' => $properties]);
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id.'?tab=history', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.history.data.0.properties.after.additional_issue.actual_issue_on', '2026-10-15')
        ->assertJsonPath('props.history.data.0.properties.before.additional_issue.actual_issue_on', '2026-10-15');
    expect($event->fresh()->properties['after']['additional_issue']['actual_issue_on'])->toBe('2026-10-14T16:00:00.000000Z');
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id, ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.additionalIssues.data.0.actual_issue_on', '2026-10-15');
});
