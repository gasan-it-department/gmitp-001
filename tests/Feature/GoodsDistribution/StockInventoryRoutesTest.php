<?php

use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\Users\Enums\EnumPermissionModule;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\Permission;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(function () {
    $this->withoutVite();
    goodsInventoryFixture($this);
});
afterEach(fn () => goodsInventoryCleanup());

it('opens every inventory page without Action Center access', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $receipt = goodsReceipt($this, true);
    foreach ([
        'inventory' => 'Index', 'items' => 'Catalog', 'programs' => 'Programs', 'settings' => 'Catalog',
        'stock-receipts' => 'Receipts', 'stock-receipts/create' => 'ReceiptForm',
        "stock-receipts/{$receipt->id}" => 'ReceiptDetails', "inventory/{$this->item->id}" => 'ItemDetails',
    ] as $path => $component) {
        $this->get('/inventory-test/goods-distribution/'.$path)->assertOk()->assertInertia(fn (AssertableInertia $page) => $page->component('GoodsDistribution/Inventory/'.$component)->where('canManage', true));
    }
    expect($this->actor->can('action_center.access'))->toBeFalse();
});

it('serializes receipt lines as a plain list on detail edit and history pages', function (string $status) {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $receipt = goodsReceipt($this, $status !== 'draft', ['lines' => [
        ['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1'],
        ['item_id' => $this->item->id, 'quantity' => '2'],
    ]]);
    if ($status === 'voided') {
        app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Incorrect receipt', true, true);
    }
    $base = '/inventory-test/goods-distribution';
    foreach (['', '/edit'] as $suffix) {
        $this->get($base.'/stock-receipts/'.$receipt->id.$suffix, ['X-Inertia' => 'true'])
            ->assertOk()
            ->assertJsonPath('props.receipt.status', $status)
            ->assertJsonPath('props.receipt.lines', fn ($lines) => is_array($lines) && array_is_list($lines) && count($lines) === 2)
            ->assertJsonPath('props.receipt.lines.0.item_id', $this->item->id)
            ->assertJsonPath('props.receipt.lines.0.item_name', 'Rice')
            ->assertJsonPath('props.receipt.lines.1.quantity', '2.000')
            ->assertJsonMissingPath('props.receipt.lines.data');
    }
    foreach (['/stock-receipts', '/programs/'.$this->program->id.'?tab=receipts'] as $path) {
        $this->get($base.$path, ['X-Inertia' => 'true'])->assertOk()
            ->assertJsonPath('props.records.data.0.lines', fn ($lines) => is_array($lines) && array_is_list($lines) && count($lines) === 2)
            ->assertJsonMissingPath('props.records.data.0.lines.data');
    }
})->with(['draft', 'posted', 'voided']);

it('enforces view and access dependencies on pages and commands', function () {
    goodsInventoryHttp($this, []);
    $this->actor->syncPermissions(['goods_distribution.inventory.manage']);
    $this->get('/inventory-test/goods-distribution/inventory')->assertForbidden();
    $this->postJson('/api/goods-distribution/stock-receipts', goodsReceiptData($this))->assertForbidden();
    $this->actor->syncPermissions(['goods_distribution.access']);
    $this->get('/inventory-test/goods-distribution/inventory')->assertForbidden();
});

it('keeps setup and receiving separate from adjustment permissions', function () {
    goodsInventoryHttp($this, []);
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $this->postJson('/api/goods-distribution/catalog/items', ['code' => 'SUGAR', 'name' => 'Sugar', 'base_unit' => 'kg', 'is_active' => true])->assertForbidden();
    $this->postJson('/api/goods-distribution/stock-receipts', goodsReceiptData($this))->assertForbidden();
    $this->get('/inventory-test/goods-distribution/stock-receipts/create')->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->postJson("/api/goods-distribution/stock-batches/{$line->id}/adjustments", ['operation_key' => (string) Str::uuid(), 'direction' => 'remove', 'quantity' => '5', 'reason' => 'Damaged rice', 'reference' => 'COUNT-1'])->assertForbidden();
    $this->postJson("/api/goods-distribution/stock-receipts/{$receipt->id}/void", ['reason' => 'Incorrect receipt'])->assertForbidden();
    $draft = goodsReceipt($this);
    $this->postJson("/api/goods-distribution/stock-receipts/{$draft->id}/void", ['reason' => 'Duplicate receipt'])->assertOk();
    expect(StockMovement::count())->toBe(1)->and($draft->fresh()->status)->toBe('voided');
    goodsInventoryHttp($this, ['goods_distribution.inventory.adjust']);
    $this->postJson('/api/goods-distribution/stock-receipts', goodsReceiptData($this))->assertForbidden();
    $this->postJson("/api/goods-distribution/stock-receipts/{$receipt->id}/void", ['reason' => 'Incorrect receipt'])->assertOk();
});

it('validates complete receipt commands and posts only the reviewed draft', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->postJson('/api/goods-distribution/stock-receipts', [])->assertUnprocessable()->assertJsonValidationErrors(['stock_source_id', 'storage_location_id', 'received_on', 'lines']);
    $data = goodsReceiptData($this);
    $data['lines'][0] = ['item_id' => $this->item->id, 'quantity' => '0.0001'];
    $this->postJson('/api/goods-distribution/stock-receipts', $data)->assertUnprocessable()->assertJsonValidationErrors(['lines.0.quantity']);
    $data['lines'][0] = ['item_id' => $this->item->id, 'quantity' => '0'];
    $this->postJson('/api/goods-distribution/stock-receipts', $data)->assertUnprocessable();
    $created = $this->postJson('/api/goods-distribution/stock-receipts', goodsReceiptData($this), ['X-Municipality-Slug' => 'inventory-test'])->assertOk()->json('data.id');
    $receipt = StockReceipt::findOrFail($created)->load(['lines.item', 'lines.program', 'source', 'location']);
    expect($receipt->receipt_number)->toBe('GR-'.$created)->and(StockMovement::count())->toBe(0);
    $this->postJson("/api/goods-distribution/stock-receipts/{$created}/post", ['draft_fingerprint' => str_repeat('a', 64)])->assertUnprocessable();
    $payload = ['draft_fingerprint' => app(ReceiptFingerprintService::class)->make($receipt)];
    $this->postJson("/api/goods-distribution/stock-receipts/{$created}/post", $payload)->assertOk();
    $this->postJson("/api/goods-distribution/stock-receipts/{$created}/post", $payload)->assertOk();
    expect(StockMovement::count())->toBe(1);
    $this->patchJson("/api/goods-distribution/stock-receipts/{$created}", [...goodsReceiptData($this), ...$payload])->assertUnprocessable();
});

it('validates counted items and adjustment references with tenant isolation', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage', 'goods_distribution.inventory.adjust']);
    $itemId = $this->postJson('/api/goods-distribution/catalog/items', ['code' => 'FAN', 'name' => 'Electric fan', 'base_unit' => 'piece', 'is_active' => true])->assertOk()->json('data.id');
    $this->postJson('/api/goods-distribution/stock-receipts', goodsReceiptData($this, ['lines' => [['item_id' => $itemId, 'quantity' => '1.5']]]))->assertUnprocessable();
    $receipt = goodsReceipt($this, true);
    $lineId = $receipt->lines->first()->id;
    $this->postJson("/api/goods-distribution/stock-batches/{$lineId}/adjustments", ['operation_key' => (string) Str::uuid(), 'quantity' => '5', 'direction' => 'remove'])->assertUnprocessable()->assertJsonValidationErrors(['reason', 'reference']);
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->get("/inventory-test/goods-distribution/stock-receipts/{$receipt->id}")->assertNotFound();
    $this->postJson("/api/goods-distribution/stock-batches/{$lineId}/adjustments", ['operation_key' => (string) Str::uuid(), 'quantity' => '5', 'direction' => 'remove', 'reason' => 'Damage counted', 'reference' => 'COUNT-1'])->assertNotFound();
});

it('catalogues Goods Distribution capabilities without granting them during seeding', function () {
    $goods = array_filter(EnumPermissions::cases(), fn ($permission) => $permission->module() === EnumPermissionModule::GOODS_DISTRIBUTION);
    foreach ($goods as $permission) {
        Permission::where('name', $permission->value)->delete();
    }
    (new \Database\Seeders\PermissionSeeder)->run();
    foreach ($goods as $permission) {
        expect(Permission::where('name', $permission->value)->exists())->toBeTrue();
        expect($this->actor->can($permission->value))->toBeFalse();
    }
    expect(EnumPermissions::GOODS_DISTRIBUTION_INVENTORY_MANAGE->dependencies())->toBe(['goods_distribution.access', 'goods_distribution.inventory.view']);
    expect(EnumPermissions::GOODS_DISTRIBUTION_INVENTORY_ADJUST->dependencies())->toBe(['goods_distribution.access', 'goods_distribution.inventory.view']);
});
