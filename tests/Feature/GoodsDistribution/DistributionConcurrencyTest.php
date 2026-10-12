<?php

use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    goodsDistributionFixture($this);
});
afterEach(function () {
    if (DB::getDriverName() === 'pgsql') {
        goodsDistributionCleanup();
    }
});

function distributionWorker($request, string $transition, array $data = []): array
{
    return ['command' => 'distribution', 'transition' => $transition, 'request_id' => $request->id,
        'data' => ['version' => $request->version, 'operation_key' => (string) Str::uuid(), ...$data]];
}

it('serializes competing approvals without over-reserving the last stock', function () {
    $line = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '3']]])->lines->first();
    $a = goodsTransition($this, goodsRequest($this), 'review');
    $b = goodsTransition($this, goodsRequest($this), 'review');
    $results = competingGoodsCommands($this, [distributionWorker($a, 'approve', ['recipient_reviewed' => true]), distributionWorker($b, 'approve', ['recipient_reviewed' => true])]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(2000)->and(DistributionStockAllocation::count())->toBe(1);
});

it('serializes duplicate releases and records one handover movement', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $command = distributionWorker($request, 'release', goodsReleaseData($request));
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    expect(StockMovement::where('type', 'distribution')->count())->toBe(1)->and(app(StockLedgerService::class)->balance($line))->toBe(248000);
});

it('makes cancellation and release mutually exclusive', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $results = competingGoodsCommands($this, [
        distributionWorker($request, 'cancel', ['reason' => 'Recipient withdrew request']),
        distributionWorker($request, 'release', goodsReleaseData($request)),
    ]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(0);
    $released = $request->fresh()->status->value === 'released';
    expect(StockMovement::where('type', 'distribution')->count())->toBe($released ? 1 : 0);
    expect(app(StockLedgerService::class)->balance($line))->toBe($released ? 248000 : 250000);
});

it('protects stock when approval competes with removal or receipt voiding', function (string $command) {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $stock = $command === 'void'
        ? ['command' => 'void', 'receipt_id' => $receipt->id]
        : ['command' => 'adjust', 'line_id' => $line->id, 'quantity' => '250', 'direction' => 'remove', 'key' => (string) Str::uuid()];
    $results = competingGoodsCommands($this, [distributionWorker($request, 'approve', ['recipient_reviewed' => true]), $stock]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->balance($line))->toBeGreaterThanOrEqual(app(StockLedgerService::class)->reserved($line));
})->with(['adjust', 'void']);

it('serializes identical household syncs without duplicate audits', function () {
    $request = goodsRequest($this)->refresh();
    $this->household->update(['street' => 'Updated street']);
    $command = ['command' => 'sync-household', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'household_reviewed' => true,
        'registry_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionHouseholdService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true], json_encode($results))->and($request->fresh()->version)->toBe(2)
        ->and(DB::table('activity_log')->where('description', 'Synced goods request household')->count())->toBe(1);
});

it('requires re-review when household sync competes with approval', function () {
    goodsReceipt($this, true);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $this->member->update(['relationship' => 'parent']);
    $sync = ['command' => 'sync-household', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'household_reviewed' => true,
        'registry_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionHouseholdService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$sync, distributionWorker($request, 'approve', ['recipient_reviewed' => true])]);
    expect(array_column($results, 'ok'))->toBe([true, false])->and($request->fresh()->status->value)->toBe('under_review')
        ->and(DistributionStockAllocation::count())->toBe(0);
});
