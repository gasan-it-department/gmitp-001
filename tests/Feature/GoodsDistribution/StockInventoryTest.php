<?php

use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Actions\PostStockReceiptAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReverseStockAdjustmentAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(fn () => goodsInventoryFixture($this));
afterEach(fn () => goodsInventoryCleanup());

it('posts ten sacks once and records damage and its reversal with readable audits', function () {
    $receipt = goodsReceipt($this);
    expect(StockMovement::count())->toBe(0);
    $fingerprint = app(ReceiptFingerprintService::class)->make($receipt);
    $post = app(PostStockReceiptAction::class);
    $post->execute($this->municipalId, $receipt->id, $this->actor->id, $fingerprint);
    $post->execute($this->municipalId, $receipt->id, $this->actor->id, $fingerprint);
    $line = $receipt->lines->first();
    expect(StockMovement::count())->toBe(1)->and(app(StockLedgerService::class)->balance($line))->toBe(250000);
    $dto = new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged rice', 'COUNT-1', '5', 'remove');
    $adjust = app(AdjustStockAction::class)->execute($line->id, $dto);
    app(AdjustStockAction::class)->execute($line->id, $dto);
    expect(app(StockLedgerService::class)->balance($line))->toBe(245000)->and(StockMovement::count())->toBe(2);
    $reverseDto = new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Correct damaged count', 'COUNT-2');
    app(ReverseStockAdjustmentAction::class)->execute($adjust->id, $reverseDto);
    app(ReverseStockAdjustmentAction::class)->execute($adjust->id, $reverseDto);
    expect(app(StockLedgerService::class)->balance($line))->toBe(250000)->and(StockMovement::count())->toBe(3);
    expect(DB::table('activity_log')->where('log_name', 'goods-inventory')->count())->toBe(4);
    expect(DB::table('activity_log')->where('description', 'Adjusted stock')->value('properties'))->toContain('245.000', '250.000');
});

it('uses exact decimal quantities and rejects invalid counted or packaged goods', function () {
    $service = app(StockQuantityService::class);
    expect($service->format($service->parse('0.250')))->toBe('0.250');
    expect($service->received(['package_type' => 'pack', 'package_count' => 100, 'quantity_per_package' => '0.125'], 'kg'))->toBe('12.500');
    expect($service->parse('999999999999.999'))->toBe(999999999999999);
    foreach (['0.0001', '1e3', '-2', 'NaN', '1.1234'] as $quantity) {
        expect(fn () => $service->parse($quantity))->toThrow(DomainException::class);
    }
    expect(fn () => $service->parse('0.5', 'piece'))->toThrow(DomainException::class);
    expect(fn () => $service->received(['quantity' => '0'], 'kg'))->toThrow(DomainException::class);
    expect(fn () => $service->received(['package_type' => 'sack', 'package_count' => 2, 'quantity_per_package' => '999999999999.999'], 'kg'))->toThrow(DomainException::class);
});

it('locks item units after draft use and preserves inactive history', function () {
    goodsReceipt($this);
    $dto = new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, ['code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'piece', 'is_active' => true], $this->item->id);
    expect(fn () => app(ManageCatalogAction::class)->execute($dto))->toThrow(DomainException::class);
    app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, ['code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => false, 'confirm_shared_change' => true], $this->item->id));
    expect(app(ReadGoodsInventoryAction::class)->catalog($this->municipalId, CatalogKind::Items, new InventoryFiltersDto)->items()[0]->base_unit_locked)->toBeTrue();
    expect(fn () => goodsReceipt($this))->toThrow(DomainException::class);
});

it('blocks stale posting after draft edits or source changes', function () {
    $receipt = goodsReceipt($this);
    $old = app(ReceiptFingerprintService::class)->make($receipt);
    app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, goodsReceiptData($this, ['draft_fingerprint' => $old, 'reference' => 'NEW-REFERENCE']), $receipt->id));
    expect(fn () => app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, $old))->toThrow(DomainException::class);
    $receipt = $receipt->fresh(['lines.item', 'lines.program', 'source', 'location']);
    $fingerprint = app(ReceiptFingerprintService::class)->make($receipt);
    $this->source->update(['name' => 'Renamed donor']);
    expect(fn () => app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, $fingerprint))->toThrow(DomainException::class);
    expect(StockMovement::count())->toBe(0);
});

it('rolls back a draft edit completely when any line is invalid', function () {
    $receipt = goodsReceipt($this);
    $lineId = $receipt->lines->first()->id;
    $data = goodsReceiptData($this, ['reference' => 'SHOULD-ROLLBACK', 'draft_fingerprint' => app(ReceiptFingerprintService::class)->make($receipt)]);
    $data['lines'][] = ['item_id' => (string) Str::ulid(), 'quantity' => '1'];
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data, $receipt->id)))->toThrow(DomainException::class);
    expect($receipt->fresh()->reference)->toBe('DELIVERY-1')->and($receipt->fresh('lines')->lines->first()->id)->toBe($lineId);
});

it('freezes posted names and keeps expired and voided movements in balance calculations', function () {
    $receipt = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '100', 'expires_on' => today()->subDay()->toDateString()]]]);
    $this->source->update(['name' => 'New donor name']);
    $this->item->update(['name' => 'New rice name']);
    $this->location->update(['name' => 'New storage name']);
    expect($receipt->fresh()->source_name_snapshot)->toBe('Private donor')->and($receipt->fresh('lines')->lines->first()->item_name_snapshot)->toBe('Rice');
    $filters = new InventoryFiltersDto(['expiry' => 'expired']);
    expect((string) \Brick\Math\BigDecimal::of((string) app(ReadGoodsInventoryAction::class)->inventory($this->municipalId, $filters)->items()[0]->balance)->toScale(3))->toBe('100.000');
    app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Incorrect delivery', false, true);
    expect(app(StockLedgerService::class)->balance($receipt->lines->first()))->toBe(0);
    expect(StockMovement::count())->toBe(2)->and($receipt->fresh()->status)->toBe('voided');
});

it('preserves donor and program batches with filters and opening stock', function () {
    goodsReceipt($this, true, ['kind' => 'opening']);
    $receipt = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '10']]]);
    expect(StockMovement::where('type', 'opening')->count())->toBe(1);
    $read = app(ReadGoodsInventoryAction::class);
    expect((string) \Brick\Math\BigDecimal::of((string) $read->inventory($this->municipalId, new InventoryFiltersDto)->items()[0]->balance)->toScale(3))->toBe('260.000');
    expect((string) \Brick\Math\BigDecimal::of((string) $read->inventory($this->municipalId, new InventoryFiltersDto(['program_id' => 'unassigned']))->items()[0]->balance)->toScale(3))->toBe('10.000');
    expect($read->item($this->municipalId, $this->item->id, new InventoryFiltersDto)['batches']->total())->toBe(2);
    expect($receipt->lines->first()->program_id)->toBeNull();
});

it('blocks insufficient adjustments and changed idempotency payloads', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $action = app(AdjustStockAction::class);
    expect(fn () => $action->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Too much damage', 'COUNT-1', '251', 'remove')))->toThrow(DomainException::class);
    $key = (string) Str::uuid();
    $action->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, $key, 'Count correction', 'COUNT-2', '1', 'add'));
    expect(fn () => $action->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, $key, 'Count correction', 'COUNT-2', '2', 'add')))->toThrow(DomainException::class);
    expect(StockMovement::count())->toBe(2);
});

it('blocks a second reversal and reversal that would consume unavailable stock', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $adjustment = app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Additional counted stock', 'COUNT-1', '10'));
    app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'All stock damaged', 'COUNT-2', '260', 'remove'));
    expect(fn () => app(ReverseStockAdjustmentAction::class)->execute($adjustment->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Wrong addition', 'COUNT-3')))->toThrow(DomainException::class);
    $removal = StockMovement::where('reference', 'COUNT-2')->firstOrFail();
    app(ReverseStockAdjustmentAction::class)->execute($removal->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Restore damaged count', 'COUNT-4'));
    expect(fn () => app(ReverseStockAdjustmentAction::class)->execute($removal->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Second reversal', 'COUNT-5')))->toThrow(DomainException::class);
});

it('requires intact stock to void and permits void after adjustments are reversed', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $adjust = app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damage counted', 'COUNT-1', '5', 'remove'));
    $void = app(VoidStockReceiptAction::class);
    expect(fn () => $void->execute($this->municipalId, $receipt->id, $this->actor->id, 'Wrong delivery', true, true))->toThrow(DomainException::class);
    expect($receipt->fresh()->status)->toBe('posted');
    app(ReverseStockAdjustmentAction::class)->execute($adjust->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Correction before void', 'COUNT-2'));
    $void->execute($this->municipalId, $receipt->id, $this->actor->id, 'Wrong delivery', false, true);
    $void->execute($this->municipalId, $receipt->id, $this->actor->id, 'Wrong delivery', false, true);
    expect(app(StockLedgerService::class)->balance($line))->toBe(0)->and(StockMovement::count())->toBe(4);
});

it('returns identical adjustment and reversal retries after the receipt was later voided', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $adjustDto = new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged rice', 'COUNT-1', '5', 'remove');
    $adjustment = app(AdjustStockAction::class)->execute($line->id, $adjustDto);
    $reverseDto = new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Correction before void', 'COUNT-2');
    $reversal = app(ReverseStockAdjustmentAction::class)->execute($adjustment->id, $reverseDto);
    app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Wrong delivery', false, true);
    expect(app(AdjustStockAction::class)->execute($line->id, $adjustDto)->id)->toBe($adjustment->id);
    expect(app(ReverseStockAdjustmentAction::class)->execute($adjustment->id, $reverseDto)->id)->toBe($reversal->id);
    expect(StockMovement::count())->toBe(4);
});

it('locks posted drafts and movements and rejects corrections on voided batches', function () {
    $receipt = goodsReceipt($this, true);
    $entry = StockMovement::first();
    expect(fn () => $entry->update(['quantity' => '999']))->toThrow(DomainException::class);
    expect(fn () => $entry->delete())->toThrow(DomainException::class);
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, goodsReceiptData($this), $receipt->id)))->toThrow(DomainException::class);
    app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Wrong delivery', false, true);
    expect(fn () => app(AdjustStockAction::class)->execute($receipt->lines->first()->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Attempt after void', 'COUNT', '1')))->toThrow(DomainException::class);
});

it('preserves tenant isolation for catalog, receipts and item history', function () {
    $receipt = goodsReceipt($this);
    expect(fn () => app(ReadGoodsInventoryAction::class)->receipt($this->otherMunicipalId, $receipt->id))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    expect(fn () => app(ReadGoodsInventoryAction::class)->item($this->otherMunicipalId, $this->item->id, new InventoryFiltersDto))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    expect(fn () => app(ManageCatalogAction::class)->execute(new CatalogDto($this->otherMunicipalId, $this->actor->id, CatalogKind::Items, ['code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true], $this->item->id)))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
    expect(StockReceipt::count())->toBe(1);
});

it('rolls back every receipt reversal when a later batch cannot be voided', function () {
    $receipt = goodsReceipt($this, true, ['lines' => [
        ['item_id' => $this->item->id, 'quantity' => '100'],
        ['item_id' => $this->item->id, 'quantity' => '50'],
    ]]);
    $second = $receipt->lines->last();
    app(AdjustStockAction::class)->execute($second->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Damaged stock', 'COUNT-1', '1', 'remove'));
    expect(fn () => app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Incorrect delivery', false, true))->toThrow(DomainException::class);
    expect(StockMovement::count())->toBe(3)->and($receipt->fresh()->status)->toBe('posted');
    expect(app(StockLedgerService::class)->balance($receipt->lines->first()))->toBe(100000);
    expect(app(StockLedgerService::class)->balance($second))->toBe(49000);
});

it('receives explicitly unknown opening stock with exact fractional balances', function () {
    $source = app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Sources, ['code' => 'UNKNOWN', 'name' => 'Unknown historical source', 'source_type' => 'unknown', 'is_active' => true]));
    $receipt = goodsReceipt($this, true, ['kind' => 'opening', 'stock_source_id' => $source->id, 'lines' => [['item_id' => $this->item->id, 'quantity' => '0.250']]]);
    $line = $receipt->lines->first();
    app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Physical stock correction', 'COUNT-1', '0.125', 'remove'));
    expect(app(StockLedgerService::class)->balance($line))->toBe(125);
    expect($receipt->source_name_snapshot)->toBe('UNKNOWN HISTORICAL SOURCE')->and($line->program_id)->toBeNull();
});
