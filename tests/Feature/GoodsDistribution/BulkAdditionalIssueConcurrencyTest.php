<?php

use App\Core\GoodsDistribution\Actions\ManageBulkAdditionalIssueAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkAdditionalIssueService;
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

function additionalWorker($dispatch, string $command, $issue = null, array $data = []): array
{
    return ['command' => 'bulk-additional', 'dispatch_id' => $dispatch->id, 'additional_command' => $command, 'issue_id' => $issue?->id,
        'data' => ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), ...$data]];
}

function concurrentExtra(object $test, $dispatch, string $quantity = '20', bool $approve = false)
{
    $command = additionalWorker($dispatch, 'create', data: ['reason' => 'Additional quantities for households at the venue',
        'lines' => [['item_id' => $test->item->id, 'quantity' => $quantity]]]);
    $action = app(ManageBulkAdditionalIssueAction::class);
    $issue = $action->execute(new BulkDispatchDto($test->municipalId, $test->actor->id, $command['data'], $dispatch->id), 'create');
    if ($approve) {
        $preview = app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue);
        $issue = $action->execute(new BulkDispatchDto($test->municipalId, $test->actor->id,
            additionalWorker($dispatch, 'approve', $issue, ['fingerprint' => $preview['fingerprint']])['data'], $dispatch->id), 'approve', $issue->id);
    }

    return $issue;
}

it('issues an additional pickup once for simultaneous identical retries', function () {
    $dispatch = bulkDepart($this);
    $issue = concurrentExtra($this, $dispatch, approve: true);
    $command = additionalWorker($dispatch, 'issue', $issue, ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
        'confirmed_allocation_ids' => $issue->allocations()->pluck('id')->all()]);
    $result = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($result, 'ok'))->toBe([true, true], json_encode($result))
        ->and(StockMovement::where('type', 'bulk_dispatch')->count())->toBe(2)
        ->and(app(StockLedgerService::class)->balance($this->item->receiptLines()->first()))->toBe(130000);
});

it('serializes additional approval against an individual approval using shared available stock', function () {
    $dispatch = bulkDepart($this);
    $issue = concurrentExtra($this, $dispatch, '140');
    $preview = app(BulkAdditionalIssueService::class)->preview($dispatch->fresh(), $issue);
    $individual = goodsTransition($this, goodsRequest($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '20']]]), 'review');
    $result = competingGoodsCommands($this, [
        additionalWorker($dispatch, 'approve', $issue, ['fingerprint' => $preview['fingerprint']]),
        ['command' => 'distribution', 'request_id' => $individual->id, 'transition' => 'approve',
            'data' => ['version' => $individual->version, 'operation_key' => (string) Str::uuid(), 'recipient_reviewed' => true]],
    ]);
    expect(count(array_filter($result, fn ($entry) => $entry['ok'])))->toBe(1, json_encode($result))
        ->and(app(StockLedgerService::class)->reserved($this->item->receiptLines()->first()))->toBeIn([20000, 140000]);
});

it('serializes cancellation against pickup without consuming or releasing another issue', function () {
    $dispatch = bulkDepart($this);
    $issue = concurrentExtra($this, $dispatch, approve: true);
    $result = competingGoodsCommands($this, [
        additionalWorker($dispatch, 'cancel', $issue, ['reason' => 'Extra pickup is no longer required']),
        additionalWorker($dispatch, 'issue', $issue, ['actual_on' => today()->toDateString(), 'custodian_acknowledged' => true,
            'confirmed_allocation_ids' => $issue->allocations()->pluck('id')->all()]),
    ]);
    expect(count(array_filter($result, fn ($entry) => $entry['ok'])))->toBe(1, json_encode($result));
    $batch = $this->item->receiptLines()->first();
    expect(app(StockLedgerService::class)->reserved($batch))->toBe(0)
        ->and(app(StockLedgerService::class)->balance($batch))->toBe($issue->fresh()->status->value === 'issued' ? 130000 : 150000);
});

it('does not close a dispatch while an additional issue is concurrently created', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '100']]);
    $result = competingGoodsCommands($this, [
        additionalWorker($dispatch, 'create', data: ['reason' => 'More households arrived for goods', 'lines' => [['item_id' => $this->item->id, 'quantity' => '20']]]),
        ['command' => 'bulk-transition', 'dispatch_id' => $dispatch->id, 'transition' => 'close',
            'data' => ['version' => $dispatch->version, 'operation_key' => (string) Str::uuid()]],
    ]);
    expect(count(array_filter($result, fn ($entry) => $entry['ok'])))->toBe(1, json_encode($result));
    if ($dispatch->fresh()->status->value === 'closed') {
        expect(DB::table('gd_bulk_dispatch_additional_issues')->count())->toBe(0);
    } else {
        expect(DB::table('gd_bulk_dispatch_additional_issues')->where('status', 'pending')->count())->toBe(1);
    }
});
