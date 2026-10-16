<?php

use App\Core\GoodsDistribution\Models\BulkDispatchStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    bulkFixture($this);
    goodsReceipt($this, true);
});
afterEach(fn () => DB::getDriverName() === 'pgsql' ? goodsDistributionCleanup() : null);

function bulkWorker($dispatch, string $transition, array $data = []): array
{
    return ['command' => 'bulk-transition', 'dispatch_id' => $dispatch->id, 'transition' => $transition,
        'data' => ['version' => $dispatch->version, 'operation_key' => (string) Str::uuid(), ...$data]];
}

it('serializes competing individual and bulk approvals on the same batch', function () {
    $batch = $this->item->receiptLines()->first();
    $individual = goodsTransition($this, goodsRequest($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '150']]]), 'review');
    $bulk = bulkDraft($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '150']]]);
    $preview = app(BulkDispatchAllocationService::class)->approvalPreview($bulk);
    $commands = [
        ['command' => 'distribution', 'request_id' => $individual->id, 'transition' => 'approve',
            'data' => ['version' => $individual->version, 'operation_key' => (string) Str::uuid(), 'recipient_reviewed' => true]],
        bulkWorker($bulk, 'approve', ['fingerprint' => $preview['fingerprint']]),
    ];
    $result = competingGoodsCommands($this, $commands);
    expect(count(array_filter($result, fn ($entry) => $entry['ok'])))->toBe(1, json_encode($result));
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(150000);
});

it('makes duplicate departure retries create only one warehouse movement', function () {
    $bulk = bulkApprove($this, bulkDraft($this));
    $command = bulkWorker($bulk, 'dispatch', ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
        'confirmed_allocation_ids' => $bulk->allocations()->pluck('id')->all()]);
    $result = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($result, 'ok'))->toBe([true, true], json_encode($result))
        ->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(1)
        ->and(BulkDispatchStockAllocation::where('status', 'issued')->count())->toBe(1);
});

it('serializes withdrawal and departure so stock is either reserved or issued once', function () {
    $bulk = bulkApprove($this, bulkDraft($this));
    $result = competingGoodsCommands($this, [
        bulkWorker($bulk, 'withdraw', ['reason' => 'Goods request needs correction']),
        bulkWorker($bulk, 'dispatch', ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
            'confirmed_allocation_ids' => $bulk->allocations()->pluck('id')->all()]),
    ]);
    expect(count(array_filter($result, fn ($entry) => $entry['ok'])))->toBe(1, json_encode($result));
    $batch = $this->item->receiptLines()->first();
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(0)
        ->and(app(StockLedgerService::class)->balance($batch))->toBe($bulk->fresh()->status->value === 'dispatched' ? 150000 : 250000);
});
