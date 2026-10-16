<?php

use App\Core\GoodsDistribution\Actions\PostStockReceiptAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockSource;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\Users\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    goodsInventoryFixture($this);
    $this->travelTo(now()->setDate(2026, 10, 15)->setTime(10, 0));
});

afterEach(function () {
    $this->travelBack();
    goodsInventoryCleanup();
});

it('uses one yearly GR sequence for deliveries and opening stock while retaining ULID identities', function () {
    $first = goodsReceipt($this, false, ['receipt_number' => 'CLIENT-NUMBER', 'reference' => 'DONOR-INVOICE-17']);
    $opening = goodsReceipt($this, false, ['kind' => 'opening']);
    $third = goodsReceipt($this);

    expect($first->receipt_number)->toBe('GR-2026-000001')
        ->and($opening->receipt_number)->toBe('GR-2026-000002')
        ->and($third->receipt_number)->toBe('GR-2026-000003')
        ->and(Str::isUlid($first->id))->toBeTrue()
        ->and($first->reference)->toBe('DONOR-INVOICE-17')
        ->and($first->id)->not->toBe($first->receipt_number)
        ->and($first->lines->first()->stock_receipt_id)->toBe($first->id)
        ->and(StockMovement::count())->toBe(0);
});

it('uses creation year rather than the received date and resets at the Manila year boundary', function () {
    $this->travelTo(now()->setDate(2026, 12, 31)->setTime(23, 59, 59));
    expect(goodsReceipt($this, false, ['received_on' => '2025-12-01'])->receipt_number)->toBe('GR-2026-000001');
    $this->travelTo(now()->addSecond());
    expect(goodsReceipt($this, false, ['received_on' => '2026-12-31'])->receipt_number)->toBe('GR-2027-000001');
});

it('preserves a legacy receipt number and ID when its draft is edited', function () {
    $receipt = goodsReceipt($this);
    $legacy = 'GR-'.$receipt->id;
    $receipt->update(['receipt_number' => $legacy]);
    $receipt->refresh();
    $data = goodsReceiptData($this, ['receipt_number' => 'REPLACE-ME', 'reference' => 'SUPPLIER-19',
        'draft_fingerprint' => app(ReceiptFingerprintService::class)->make($receipt)]);
    $updated = app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data, $receipt->id));

    expect($updated->receipt_number)->toBe($legacy)->and($updated->id)->toBe($receipt->id)
        ->and($updated->reference)->toBe('SUPPLIER-19');
    expect(goodsReceipt($this)->receipt_number)->toBe('GR-2026-000001');
});

it('preserves legacy numbers and original batch links when a receipt is posted', function () {
    $receipt = goodsReceipt($this);
    $legacy = 'GR-'.$receipt->id;
    $receipt->update(['receipt_number' => $legacy]);
    $batch = $receipt->lines->first();
    $posted = app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id,
        app(ReceiptFingerprintService::class)->make($receipt));

    expect($posted->receipt_number)->toBe($legacy)->and($posted->id)->toBe($receipt->id)
        ->and($posted->lines->first()->id)->toBe($batch->id)
        ->and(StockMovement::first()->stock_receipt_line_id)->toBe($batch->id)
        ->and($batch->fresh()->stock_receipt_id)->toBe($receipt->id);
});

it('does not reuse voided receipt numbers', function () {
    $receipt = goodsReceipt($this);
    app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Duplicate delivery record', true, false);
    expect($receipt->fresh()->receipt_number)->toBe('GR-2026-000001');
    expect(goodsReceipt($this)->receipt_number)->toBe('GR-2026-000002');
});

it('does not consume a number when receipt creation rolls back', function () {
    $data = goodsReceiptData($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '0']]]);
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data)))
        ->toThrow(DomainException::class);
    expect(StockReceipt::count())->toBe(0)->and(StockMovement::count())->toBe(0);
    expect(goodsReceipt($this)->receipt_number)->toBe('GR-2026-000001');
});

it('shares receipt numbering across programs and continues beyond six digits', function () {
    $receipt = goodsReceipt($this);
    $receipt->update(['receipt_number' => 'GR-2026-999999']);
    $program = Program::create(['municipal_id' => $this->municipalId, 'code' => 'RELIEF', 'name' => 'Relief', 'is_active' => true]);
    $other = goodsReceipt($this, false, ['lines' => [['item_id' => $this->item->id, 'program_id' => $program->id, 'quantity' => '5']]]);
    expect($other->receipt_number)->toBe('GR-2026-1000000');
});

it('uses independent municipality sequences with the existing scoped unique constraint', function () {
    $first = goodsReceipt($this);
    app()->instance('municipal_id', $this->otherMunicipalId);
    $tenant = (object) ['municipalId' => $this->otherMunicipalId];
    $tenant->actor = User::create(['id' => (string) Str::ulid(), 'municipal_id' => $tenant->municipalId, 'first_name' => 'Other', 'last_name' => 'Staff']);
    $tenant->item = Item::create(['municipal_id' => $tenant->municipalId, 'code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true]);
    $tenant->source = StockSource::create(['municipal_id' => $tenant->municipalId, 'code' => 'DONOR', 'name' => 'Other donor', 'source_type' => 'private_donor', 'is_active' => true]);
    $tenant->location = StorageLocation::create(['municipal_id' => $tenant->municipalId, 'code' => 'STORE', 'name' => 'Other storage', 'is_active' => true]);
    $tenant->program = Program::create(['municipal_id' => $tenant->municipalId, 'code' => 'FOOD', 'name' => 'Other food program', 'is_active' => true]);
    $second = goodsReceipt($tenant);
    expect($second->receipt_number)->toBe($first->receipt_number);

    $attributes = [...$second->getAttributes(), 'id' => (string) Str::ulid()];
    expect(fn () => DB::transaction(fn () => DB::table('gd_stock_receipts')->insert($attributes)))->toThrow(QueryException::class);
    app()->instance('municipal_id', $this->municipalId);
    expect(goodsReceipt($this)->receipt_number)->toBe('GR-2026-000002');
});

it('assigns distinct consecutive numbers during simultaneous receipt creation', function () {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    $results = competingGoodsCommands($this, [
        ['command' => 'save-receipt', 'data' => goodsReceiptData($this, ['reference' => 'DELIVERY-A']), 'test_now' => now()->toIso8601String()],
        ['command' => 'save-receipt', 'data' => goodsReceiptData($this, ['reference' => 'DELIVERY-B']), 'test_now' => now()->toIso8601String()],
    ]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    expect(StockReceipt::query()->orderBy('receipt_number')->pluck('receipt_number')->all())->toBe(['GR-2026-000001', 'GR-2026-000002'])
        ->and(StockMovement::count())->toBe(0);
});
