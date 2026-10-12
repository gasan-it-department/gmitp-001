<?php

use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Run with tests/Support/run-goods-postgres.php.');
    }
    goodsInventoryFixture($this);
});
afterEach(function () {
    if (DB::getDriverName() === 'pgsql') {
        goodsInventoryCleanup();
    }
});

it('serializes competing posts and creates only one movement', function () {
    $receipt = goodsReceipt($this);
    $command = ['command' => 'post', 'receipt_id' => $receipt->id, 'fingerprint' => app(ReceiptFingerprintService::class)->make($receipt)];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true])->and(StockMovement::count())->toBe(1);
});

it('serializes competing program attachments without duplicating the association', function () {
    $this->programItem->delete();
    $command = ['command' => 'program-item', 'program_id' => $this->program->id, 'item_id' => $this->item->id];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    expect(array_unique(array_column($results, 'id')))->toHaveCount(1);
    expect(\App\Core\GoodsDistribution\Models\ProgramItem::count())->toBe(1)->and(StockMovement::count())->toBe(0);
});

it('serializes posting and program deactivation without admitting disabled stock', function () {
    $receipt = goodsReceipt($this);
    $results = competingGoodsCommands($this, [
        ['command' => 'program-item', 'program_id' => $this->program->id, 'item_id' => $this->item->id, 'is_active' => false],
        ['command' => 'post', 'receipt_id' => $receipt->id, 'fingerprint' => app(ReceiptFingerprintService::class)->make($receipt)],
    ]);
    expect($this->programItem->fresh()->is_active)->toBeFalse();
    expect(StockMovement::count())->toBe($results[1]['ok'] ? 1 : 0);
    expect($receipt->fresh()->status)->toBe($results[1]['ok'] ? 'posted' : 'draft');
});

it('serializes create and attach so duplicate products cannot create orphan associations', function () {
    $data = ['name' => 'Soap bar', 'code' => 'SOAP1', 'base_unit' => 'piece', 'is_active' => true];
    $results = competingGoodsCommands($this, [
        ['command' => 'create-program-item', 'program_id' => $this->program->id, 'data' => $data],
        ['command' => 'create-program-item', 'program_id' => $this->program->id, 'data' => [...$data, 'code' => 'SOAP2', 'name' => ' SOAP-BAR! ']],
    ]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1);
    expect(\App\Core\GoodsDistribution\Models\Item::count())->toBe(2);
    expect(\App\Core\GoodsDistribution\Models\ProgramItem::count())->toBe(2)->and(StockMovement::count())->toBe(0);
});

it('serializes simultaneous normalized item creation even with different codes', function () {
    $results = competingGoodsCommands($this, [
        ['command' => 'item', 'data' => ['code' => 'SOAP-A', 'name' => 'Soap Bar', 'base_unit' => 'piece', 'is_active' => true]],
        ['command' => 'item', 'data' => ['code' => 'SOAP-B', 'name' => ' SOAP - BAR! ', 'base_unit' => 'piece', 'is_active' => true]],
    ]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1);
    expect(\App\Core\GoodsDistribution\Models\Item::where('code', 'ITM-000001')->count())->toBe(1);
    expect(StockMovement::count())->toBe(0);
});

it('allocates distinct sequential item codes during simultaneous catalog creation', function () {
    $results = competingGoodsCommands($this, [
        ['command' => 'item', 'data' => ['name' => 'Soap bar', 'base_unit' => 'piece', 'is_active' => true]],
        ['command' => 'item', 'data' => ['name' => 'Electric fan', 'base_unit' => 'piece', 'is_active' => true]],
    ]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    expect(\App\Core\GoodsDistribution\Models\Item::whereIn('id', array_column($results, 'id'))->orderBy('code')->pluck('code')->all())
        ->toBe(['ITM-000001', 'ITM-000002']);
});

it('prevents concurrent removals from overdrawing a batch', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $command = ['command' => 'adjust', 'line_id' => $line->id, 'quantity' => '200', 'direction' => 'remove'];
    $results = competingGoodsCommands($this, [[...$command, 'key' => (string) Str::uuid()], [...$command, 'key' => (string) Str::uuid()]]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1)->and(app(StockLedgerService::class)->balance($line))->toBe(50000)->and(StockMovement::count())->toBe(2);
});

it('serializes concurrent reversals and reverses an adjustment once', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $adjustment = app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged rice', 'COUNT-1', '5', 'remove'));
    $command = ['command' => 'reverse', 'movement_id' => $adjustment->id];
    $results = competingGoodsCommands($this, [[...$command, 'key' => (string) Str::uuid()], [...$command, 'key' => (string) Str::uuid()]]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1)->and(app(StockLedgerService::class)->balance($line))->toBe(250000)->and(StockMovement::count())->toBe(3);
});

it('makes adjustment and receipt voiding mutually safe under contention', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $results = competingGoodsCommands($this, [
        ['command' => 'adjust', 'line_id' => $line->id, 'quantity' => '5', 'direction' => 'remove', 'key' => (string) Str::uuid()],
        ['command' => 'void', 'receipt_id' => $receipt->id],
    ]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1)->and(StockMovement::count())->toBe(2);
    expect(app(StockLedgerService::class)->balance($line))->toBe($receipt->fresh()->status === 'voided' ? 0 : 245000);
});

it('enforces tenant unit packaging and ledger constraints in PostgreSQL', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    foreach ([
        fn () => DB::table('gd_stock_receipt_lines')->where('id', $line->id)->update(['quantity' => '0']),
        fn () => DB::table('gd_stock_receipt_lines')->where('id', $line->id)->update(['quantity' => '249']),
        fn () => DB::table('gd_stock_receipt_lines')->where('id', $line->id)->update(['municipal_id' => $this->otherMunicipalId]),
        fn () => DB::table('gd_stock_receipt_lines')->where('id', $line->id)->update(['base_unit' => 'piece']),
        fn () => DB::table('gd_stock_movements')->where('stock_receipt_line_id', $line->id)->update(['quantity' => '0']),
        fn () => DB::table('gd_stock_receipts')->where('id', $receipt->id)->delete(),
    ] as $invalid) {
        expect(fn () => DB::transaction($invalid))->toThrow(\Illuminate\Database\QueryException::class);
    }
    $copy = StockMovement::first()->getAttributes();
    $copy['id'] = (string) Str::ulid();
    $copy['operation_key'] = 'duplicate-receipt-movement';
    expect(fn () => DB::transaction(fn () => DB::table('gd_stock_movements')->insert($copy)))->toThrow(\Illuminate\Database\QueryException::class);
    expect(app(StockLedgerService::class)->balance($line))->toBe(250000);
});
