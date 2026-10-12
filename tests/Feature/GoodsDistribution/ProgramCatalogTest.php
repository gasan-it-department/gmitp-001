<?php

use App\Core\GoodsDistribution\Actions\CreateProgramItemAction;
use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Actions\ManageProgramItemAction;
use App\Core\GoodsDistribution\Actions\PostStockReceiptAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReadProgramItemsAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\ProgramItemDto;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Services\ItemDuplicateService;
use App\Core\GoodsDistribution\Services\ItemLookupService;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(fn () => goodsInventoryFixture($this));
afterEach(fn () => goodsInventoryCleanup());

function programCatalogChange(object $test, bool $active, ?string $itemId = null, bool $reactivate = false): ProgramItem
{
    return app(ManageProgramItemAction::class)->execute(new ProgramItemDto($test->municipalId, $test->actor->id, $test->program->id, $itemId ?? $test->item->id, $active, $reactivate));
}

it('attaches idempotently and reenables the same association without creating stock', function () {
    $first = programCatalogChange($this, true);
    expect(DB::table('activity_log')->count())->toBe(0);
    programCatalogChange($this, false);
    expect(programCatalogChange($this, true)->id)->toBe($first->id);
    expect(ProgramItem::count())->toBe(1)->and(StockMovement::count())->toBe(0)->and(StockReceipt::count())->toBe(0);
    expect(DB::table('activity_log')->count())->toBe(2);
    $audit = json_decode(DB::table('activity_log')->latest('id')->value('properties'), true);
    expect($audit['before']['is_active'])->toBeFalse()->and($audit['after']['is_active'])->toBeTrue();
});

it('keeps shared items independent from program availability and catalog search', function () {
    $other = Program::create(['municipal_id' => $this->municipalId, 'code' => 'RELIEF', 'name' => 'Relief', 'is_active' => true]);
    app(ManageProgramItemAction::class)->execute(new ProgramItemDto($this->municipalId, $this->actor->id, $other->id, $this->item->id));
    programCatalogChange($this, false);
    $lookup = app(ItemLookupService::class);
    expect($lookup->search($this->municipalId, '', $this->program->id)->total())->toBe(0);
    expect($lookup->search($this->municipalId, '', $other->id)->total())->toBe(1);
    expect($lookup->search($this->municipalId, '', $this->program->id, 1, 'shared')->items()[0]['program_item_active'])->toBeFalse();
    expect($this->item->fresh()->is_active)->toBeTrue();
});

it('requires explicit global reactivation and forbids enabling items in inactive programs', function () {
    $this->item->update(['is_active' => false]);
    expect(fn () => programCatalogChange($this, true))->toThrow(ValidationException::class);
    expect(programCatalogChange($this, true, reactivate: true)->item->is_active)->toBeTrue();
    $this->program->update(['is_active' => false]);
    programCatalogChange($this, false);
    expect(fn () => programCatalogChange($this, true))->toThrow(ValidationException::class);
    expect($this->programItem->fresh()->is_active)->toBeFalse();
});

it('creates and attaches atomically and keeps ordinary catalog creation unattached', function () {
    $data = ['name' => 'Soap bar', 'code' => 'SOAP', 'base_unit' => 'piece', 'category' => 'hygiene', 'is_active' => true];
    $dto = new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, $data);
    $this->program->update(['is_active' => false]);
    expect(fn () => app(CreateProgramItemAction::class)->execute($this->program->id, $dto))->toThrow(ValidationException::class);
    expect(Item::count())->toBe(1);
    $this->program->update(['is_active' => true]);
    $membership = app(CreateProgramItemAction::class)->execute($this->program->id, $dto);
    expect($membership->item->name)->toBe('SOAP BAR')->and($membership->is_active)->toBeTrue();
    app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, [...$data, 'name' => 'Electric fan', 'code' => 'FAN']));
    expect(Item::count())->toBe(3)->and(ProgramItem::count())->toBe(2)->and(StockMovement::count())->toBe(0);
});

it('uses tenant-wide duplicate review during program creation', function () {
    $data = ['name' => ' RICE! ', 'code' => 'SECOND', 'base_unit' => 'kg', 'is_active' => true];
    expect(fn () => app(CreateProgramItemAction::class)->execute($this->program->id, new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, $data)))->toThrow(ValidationException::class);
    $review = app(ItemDuplicateService::class)->check($this->municipalId, 'Premium rice', 'kg');
    expect($review['matches'][0]['connected_programs'][0]['id'])->toBe($this->program->id);
    $membership = app(CreateProgramItemAction::class)->execute($this->program->id, new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, [...$data, 'name' => 'Premium rice', 'reviewed_item_ids' => $review['reviewed_item_ids'], 'duplicate_reason' => 'Different grade of rice']));
    expect($membership->item->name)->toBe('PREMIUM RICE')->and(StockMovement::count())->toBe(0);
});

it('blocks direct receipt saves without enabled membership while allowing unassigned stock', function () {
    programCatalogChange($this, false);
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, goodsReceiptData($this))))->toThrow(ValidationException::class);
    $this->programItem->delete();
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, goodsReceiptData($this))))->toThrow(ValidationException::class);
    expect(StockReceipt::count())->toBe(0);
    $data = goodsReceiptData($this, ['lines' => [['item_id' => $this->item->id, 'program_id' => null, 'quantity' => '1']]]);
    $receipt = app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, $data));
    app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, app(ReceiptFingerprintService::class)->make($receipt));
    expect(StockMovement::count())->toBe(1);
});

it('rejects stale review and blocks posting with currently disabled membership', function () {
    $receipt = goodsReceipt($this);
    $fingerprint = app(ReceiptFingerprintService::class)->make($receipt);
    programCatalogChange($this, false);
    expect(fn () => app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, $fingerprint))->toThrow(DomainException::class);
    $fresh = app(ReceiptFingerprintService::class)->make($receipt->fresh());
    expect(fn () => app(PostStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, $fresh))->toThrow(ValidationException::class);
    expect(fn () => app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($this->municipalId, $this->actor->id, [...goodsReceiptData($this), 'draft_fingerprint' => $fingerprint], $receipt->id)))->toThrow(DomainException::class);
    expect(StockMovement::count())->toBe(0)->and($receipt->fresh()->status)->toBe('draft');
});

it('preserves stock carryover and snapshots after membership and global deactivation', function () {
    $receipt = goodsReceipt($this, true, ['received_on' => '2025-12-30']);
    programCatalogChange($this, false);
    app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, ['name' => 'Rice renamed', 'code' => 'RICE', 'base_unit' => 'kg', 'is_active' => false, 'reviewed_item_ids' => [], 'confirm_shared_change' => true], $this->item->id));
    $read = app(ReadGoodsInventoryAction::class);
    $filters = new InventoryFiltersDto(['program_id' => $this->program->id]);
    expect($read->inventory($this->municipalId, $filters)->items()[0]->balance)->toBe('250.000');
    expect($receipt->fresh('lines')->lines->first()->item_name_snapshot)->toBe('Rice');
    expect($read->movements($this->municipalId, $filters)->total())->toBe(1);
});

it('requires confirmation for shared edits without blocking unchanged legacy data', function () {
    $data = $this->item->only(['name', 'code', 'base_unit', 'is_active']);
    expect(fn () => app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, [...$data, 'is_active' => false], $this->item->id)))->toThrow(ValidationException::class);
    app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, $data, $this->item->id));
    expect($this->item->fresh()->is_active)->toBeTrue();
});

it('paginates enabled and disabled program items without requiring receipt history', function () {
    programCatalogChange($this, false);
    $read = app(ReadProgramItemsAction::class);
    expect($read->execute($this->municipalId, $this->program->id, new InventoryFiltersDto(['active' => 'inactive', 'search' => 'rice']))->total())->toBe(1);
    expect($read->execute($this->municipalId, $this->program->id, new InventoryFiltersDto(['active' => 'active']))->total())->toBe(0);
    expect(app(ReadGoodsInventoryAction::class)->inventory($this->municipalId, new InventoryFiltersDto(['program_id' => $this->program->id, 'include_zero' => '1']))->total())->toBe(0);
});

it('rejects cross-tenant catalogs and enforces manage permission on commands', function () {
    $foreign = Item::create(['municipal_id' => $this->otherMunicipalId, 'name' => 'Foreign', 'code' => 'FOREIGN', 'base_unit' => 'kg', 'is_active' => true]);
    expect(fn () => programCatalogChange($this, true, $foreign->id))->toThrow(ModelNotFoundException::class);
    goodsInventoryHttp($this, []);
    $url = '/api/goods-distribution/programs/'.$this->program->id.'/items';
    $this->postJson($url, ['item_id' => $this->item->id])->assertForbidden();
    $this->getJson('/inventory-test/goods-distribution/programs/'.$this->program->id.'?tab=items', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.records.data.0.item.id', $this->item->id);
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->postJson($url, ['item_id' => $foreign->id])->assertNotFound();
    $this->postJson($url, ['item_id' => $this->item->id])->assertOk()->assertJsonPath('data.item.id', $this->item->id);
    $this->patchJson($url.'/'.$this->item->id, ['is_active' => false])->assertOk()->assertJsonPath('data.is_active', false);
    $this->getJson('/api/goods-distribution/items/search?program_id='.$this->program->id)->assertOk()->assertJsonCount(0, 'data');
    $this->getJson('/api/goods-distribution/items/search?program_id='.$this->program->id.'&catalog_scope=shared')->assertOk()->assertJsonCount(1, 'data');
});

it('creates through the program API with category and duplicate protections', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $url = '/api/goods-distribution/programs/'.$this->program->id.'/items/create';
    $data = ['name' => 'Electric fan', 'code' => 'FAN', 'base_unit' => 'piece', 'category' => 'appliance', 'is_active' => true];
    $this->postJson($url, $data)->assertUnprocessable()->assertJsonValidationErrors('category');
    $this->postJson($url, [...$data, 'category' => null])->assertOk()->assertJsonPath('data.name', 'ELECTRIC FAN');
    $this->postJson($url, [...$data, 'category' => null, 'code' => 'FAN2'])->assertUnprocessable()->assertJsonValidationErrors('name');
    expect(Item::count())->toBe(2)->and(ProgramItem::count())->toBe(2)->and(StockMovement::count())->toBe(0);
});
