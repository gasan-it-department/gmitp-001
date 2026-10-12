<?php

use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\External\Api\Resources\GoodsDistribution\StockMovementResource;
use App\External\Api\Resources\GoodsDistribution\StockReceiptResource;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(function () {
    $this->withoutVite();
    goodsInventoryFixture($this);
});
afterEach(fn () => goodsInventoryCleanup());

it('counts distinct positive program items and draft receipts including mixed receipts', function () {
    goodsReceipt($this, true);
    goodsReceipt($this, true);
    goodsReceipt($this, false, ['lines' => [
        ['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1'],
        ['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '2'],
        ['item_id' => $this->item->id, 'quantity' => '3'],
    ]]);
    $read = app(ReadGoodsInventoryAction::class);
    $program = $read->catalog($this->municipalId, CatalogKind::Programs, new InventoryFiltersDto)->items()[0];
    expect($program->items_in_stock)->toBe(1)->and($program->draft_receipts_count)->toBe(1);
    expect(fn () => $read->program($this->otherMunicipalId, $this->program->id))->toThrow(\Illuminate\Database\Eloquent\ModelNotFoundException::class);
});

it('keeps the same item balances separate by program and carries inactive stock across years', function () {
    $other = \App\Core\GoodsDistribution\Models\Program::create(['municipal_id' => $this->municipalId, 'code' => 'RELIEF', 'name' => 'Provincial Relief', 'is_active' => true]);
    $this->travelTo(\Carbon\Carbon::parse('2027-01-15'));
    try {
        goodsReceipt($this, true, ['received_on' => '2026-12-01', 'lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '60']]]);
        goodsReceipt($this, true, ['received_on' => '2027-01-10', 'lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '100']]]);
        goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $other->id, 'quantity' => '25']]]);
        $this->item->update(['is_active' => false]);
        $read = app(ReadGoodsInventoryAction::class);
        $filters = new InventoryFiltersDto(['program_id' => $this->program->id, 'year' => 2027, 'quarter' => 1]);
        expect((string) $read->inventory($this->municipalId, $filters)->first()->balance)->toBe('160.000');
        expect((string) $read->inventory($this->municipalId, new InventoryFiltersDto(['program_id' => $other->id]))->first()->balance)->toBe('25.000');
        expect($read->receipts($this->municipalId, $filters)->total())->toBe(1);
        expect($read->program($this->municipalId, $this->program->id)->items_in_stock)->toBe(1);
    } finally {
        $this->travelBack();
    }
});

it('requires manage permission and rejects foreign or inactive scoped programs', function () {
    goodsInventoryHttp($this, []);
    $base = '/api/goods-distribution/programs/';
    $data = goodsReceiptData($this);
    $this->postJson($base.$this->program->id.'/stock-receipts', $data)->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $foreign = \App\Core\GoodsDistribution\Models\Program::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'FOREIGN', 'name' => 'Foreign', 'is_active' => true]);
    $this->get('/inventory-test/goods-distribution/programs/'.$foreign->id)->assertNotFound();
    $this->postJson($base.$foreign->id.'/stock-receipts', $data)->assertUnprocessable();
    $this->program->update(['is_active' => false]);
    $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id)->assertOk();
    $this->postJson($base.$this->program->id.'/stock-receipts', $data)->assertUnprocessable();
});

it('keeps stock independent of history dates and includes depleted program items only on request', function () {
    $receipt = goodsReceipt($this, true, ['received_on' => '2020-02-01']);
    $read = app(ReadGoodsInventoryAction::class);
    $filters = new InventoryFiltersDto(['program_id' => $this->program->id, 'year' => 2021, 'quarter' => 4]);
    expect($read->inventory($this->municipalId, $filters)->total())->toBe(1);
    expect($read->receipts($this->municipalId, $filters)->total())->toBe(0);
    expect($read->receipts($this->municipalId, new InventoryFiltersDto(['year' => 2020, 'quarter' => 1]))->total())->toBe(1);
    app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Incorrect receipt', true, true);
    expect($read->inventory($this->municipalId, $filters)->total())->toBe(0);
    expect($read->inventory($this->municipalId, new InventoryFiltersDto([...$filters->values, 'include_zero' => 1]))->total())->toBe(1);
    expect($read->program($this->municipalId, $this->program->id)->items_in_stock)->toBe(0);
});

it('fixes scoped lines to the selected program and rejects mismatches and mixed edits', function () {
    $save = app(SaveStockReceiptAction::class);
    $data = goodsReceiptData($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '1']]]);
    $receipt = $save->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data, scopedProgramId: $this->program->id));
    expect($receipt->lines->first()->program_id)->toBe($this->program->id);
    $data['lines'][0]['program_id'] = (string) Str::ulid();
    expect(fn () => $save->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data, scopedProgramId: $this->program->id)))->toThrow(DomainException::class);
    $mixed = goodsReceipt($this, false, ['lines' => [
        ['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1'],
        ['item_id' => $this->item->id, 'quantity' => '1'],
    ]]);
    $edit = goodsReceiptData($this, ['draft_fingerprint' => app(ReceiptFingerprintService::class)->make($mixed)]);
    expect(fn () => $save->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $edit, $mixed->id, $this->program->id)))->toThrow(DomainException::class);
    expect($mixed->fresh('lines')->lines)->toHaveCount(2);
    $this->program->update(['is_active' => false]);
    expect(fn () => $save->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $edit, scopedProgramId: $this->program->id)))->toThrow(DomainException::class);
});

it('provides receipt program summaries and movement table identity', function () {
    $receipt = goodsReceipt($this, true, ['lines' => [
        ['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1', 'batch_reference' => 'BATCH-1'],
        ['item_id' => $this->item->id, 'quantity' => '2'],
    ]]);
    $resource = (new StockReceiptResource($receipt))->resolve();
    expect($resource['is_mixed_program'])->toBeTrue()->and($resource['programs'])->toHaveCount(2);
    expect($resource['programs'][1])->toBe(['id' => null, 'name' => 'Unassigned']);
    $read = app(ReadGoodsInventoryAction::class);
    $movement = $read->movements($this->municipalId, new InventoryFiltersDto(['program_id' => $this->program->id]))->items()[0];
    $resource = (new StockMovementResource($movement))->resolve();
    expect($resource['item_id'])->toBe($this->item->id)->and($resource['item_name'])->toBe('Rice')
        ->and($resource['program_id'])->toBe($this->program->id)->and($resource['batch_reference'])->toBe('BATCH-1');
    expect($read->movements($this->municipalId, new InventoryFiltersDto(['year' => 1990]))->total())->toBe(0);
});

it('renders program pages and only the selected paginated tab', function () {
    goodsInventoryHttp($this, []);
    goodsReceipt($this);
    $this->get('/inventory-test/goods-distribution/programs')->assertInertia(fn (Assert $page) => $page
        ->component('GoodsDistribution/Inventory/Programs', false)->where('records.data.0.items_in_stock', 0)->where('records.data.0.draft_receipts_count', 1));
    foreach (['stock', 'receipts', 'movements'] as $tab) {
        $this->get('/inventory-test/goods-distribution/programs/'.$this->program->id.'?tab='.$tab)->assertInertia(fn (Assert $page) => $page
            ->component('GoodsDistribution/Inventory/ProgramDetails', false)->where('program.id', $this->program->id)->where('tab', $tab)
            ->has('records.data')->has('records.meta')->missing('stock')->missing('receipts')->missing('movements'));
    }
});

it('allows mixed receipt full view with context but rejects its scoped edit and omits form item catalogs', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $receipt = goodsReceipt($this, false, ['lines' => [['item_id' => $this->item->id, 'quantity' => '1']]]);
    $base = '/inventory-test/goods-distribution';
    $this->get($base.'/stock-receipts/'.$receipt->id.'?program_id='.$this->program->id)->assertOk();
    $this->get($base.'/programs/'.$this->program->id.'/stock-receipts/'.$receipt->id.'/edit')->assertNotFound();
    $this->get($base.'/programs/'.$this->program->id.'/stock-receipts/create')->assertInertia(fn (Assert $page) => $page
        ->component('GoodsDistribution/Inventory/ReceiptForm', false)->where('program.id', $this->program->id)->where('options.items', []));
    $this->get($base.'/stock-receipts/create?program_id='.(string) Str::ulid())->assertNotFound();
});

it('uses the same id response for scoped saves and rejects a mismatched scoped payload', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $url = '/api/goods-distribution/programs/'.$this->program->id.'/stock-receipts';
    $data = goodsReceiptData($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '1']]]);
    $response = $this->postJson($url, $data)->assertOk()->assertJsonStructure(['data' => ['id']]);
    $receipt = app(ReadGoodsInventoryAction::class)->receipt($this->municipalId, $response->json('data.id'));
    expect($receipt->lines->first()->program_id)->toBe($this->program->id);
    $data['draft_fingerprint'] = app(ReceiptFingerprintService::class)->make($receipt);
    $this->patchJson($url.'/'.$receipt->id, $data)->assertOk()->assertJsonPath('data.id', $receipt->id);
    $data['lines'][0]['program_id'] = (string) Str::ulid();
    $this->postJson($url, $data)->assertUnprocessable();
});
