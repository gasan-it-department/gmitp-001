<?php

use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Enums\ItemCategory;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\ItemDuplicateService;
use App\Core\GoodsDistribution\Services\ItemIdentityService;
use App\Core\GoodsDistribution\Services\ItemLookupService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(fn () => goodsInventoryFixture($this));
afterEach(fn () => goodsInventoryCleanup());

it('uppercases catalog names and generates codes for direct API creation without changing descriptive fields', function (string $kind, array $details) {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $expectedCode = CatalogKind::from($kind)->codePrefix().'-000001';
    $response = $this->postJson('/api/goods-distribution/catalog/'.$kind, [
        'name' => "  Peque\u{00F1}a delivery 2026  ", 'code' => 'new_record', 'is_active' => true, ...$details,
    ])->assertOk()->assertJsonPath('data.name', "PEQUE\u{00D1}A DELIVERY 2026")->assertJsonPath('data.code', $expectedCode);

    $model = CatalogKind::from($kind)->model();
    $saved = $model::findOrFail($response->json('data.id'));
    foreach ($details as $field => $value) {
        expect($saved->getAttribute($field))->toBe($value);
    }
    $audit = json_decode(DB::table('activity_log')->where('subject_id', $saved->id)->value('properties'), true);
    expect($audit['after']['name'])->toBe($saved->name)->and($audit['after']['code'])->toBe($expectedCode);
    expect(StockMovement::count())->toBe(0);
})->with([
    'item' => ['items', ['base_unit' => 'kg', 'description' => 'Keep this description mixed case.']],
    'program' => ['programs', ['description' => 'Quarterly purchases.']],
    'source' => ['sources', ['source_type' => 'lgu', 'contact_name' => 'Juan dela Cruz', 'contact_email' => 'juan@example.test', 'notes' => 'Staff purchase.']],
    'location' => ['locations', ['address' => 'Main Street, Uno', 'notes' => 'Side entrance.']],
]);

it('enforces uppercase at the Core boundary and on deliberate name corrections', function () {
    $created = saveCatalogItem($this, ['name' => '  soap bar  ', 'code' => 'soap_1']);
    expect($created->name)->toBe('SOAP BAR')->and($created->code)->toBe('ITM-000001');
    $updated = saveCatalogItem($this, ['name' => 'bath soap', 'code' => 'soap_1'], $created->id);
    expect($updated->name)->toBe('BATH SOAP')->and($updated->code)->toBe('ITM-000001');
});

function saveCatalogItem(object $test, array $data = [], ?string $id = null): Item
{
    return app(ManageCatalogAction::class)->execute(new CatalogDto($test->municipalId, $test->actor->id, CatalogKind::Items,
        array_replace(['code' => 'NEW', 'name' => 'New item', 'base_unit' => 'kg', 'is_active' => true, 'confirm_shared_change' => true], $data), $id));
}

function itemCatalogError(Closure $operation, string $key): void
{
    try {
        $operation();
        test()->fail('Expected duplicate validation to reject the save.');
    } catch (ValidationException $exception) {
        expect($exception->errors())->toHaveKey($key);
    }
}

it('normalizes compatibility Unicode case punctuation and whitespace without losing sizes', function () {
    $identity = app(ItemIdentityService::class);
    expect($identity->normalize("\u{FF32}\u{FF29}\u{FF23}\u{FF25}\u{00A0} - Premium!"))->toBe('rice premium');
    expect($identity->matchType('Rice premium', 'kg', 'premium rice', 'kg'))->toBe('possible');
    expect($identity->matchType('Soap 1.5 kg', 'piece', 'Soap 15 kg', 'piece'))->toBeNull();
    expect($identity->matchType('Soap .5 kg', 'piece', 'Soap 5 kg', 'piece'))->toBeNull();
    expect($identity->matchType('Soap 1/2 kg', 'piece', 'Soap 1 2 kg', 'piece'))->toBeNull();
    expect($identity->matchType('Soap 100g', 'piece', 'Soap 200g', 'piece'))->toBeNull();
});

it('blocks inactive exact matches and arbitrary force flags without creating movements', function () {
    $this->item->update(['is_active' => false]);
    itemCatalogError(fn () => saveCatalogItem($this, ['name' => ' RICE!! ', 'force' => true, 'duplicate_reason' => 'Different product', 'reviewed_item_ids' => [$this->item->id]]), 'name');
    expect(app(ItemDuplicateService::class)->check($this->municipalId, 'Rice', 'kg')['matches'][0])->toMatchArray(['id' => $this->item->id, 'is_active' => false, 'match_type' => 'exact']);
    expect(Item::count())->toBe(1)->and(StockMovement::count())->toBe(0);
});

it('requires complete review and a trimmed reason and records them in the existing audit', function () {
    $data = ['name' => 'Premium rice'];
    itemCatalogError(fn () => saveCatalogItem($this, $data), 'reviewed_item_ids');
    $data['reviewed_item_ids'] = [$this->item->id];
    foreach (['    ', '  four  ', str_repeat('x', 1001)] as $reason) {
        itemCatalogError(fn () => saveCatalogItem($this, [...$data, 'duplicate_reason' => $reason]), 'duplicate_reason');
    }
    $saved = saveCatalogItem($this, [...$data, 'duplicate_reason' => '  Different grade  ']);
    $audit = json_decode(DB::table('activity_log')->where('subject_id', $saved->id)->value('properties'), true);
    expect($audit['after'])->toMatchArray(['reviewed_item_ids' => [$this->item->id], 'duplicate_reason' => 'Different grade']);
    expect(StockMovement::count())->toBe(0);
});

it('rejects candidates added or removed after checking and duplicate reviewed IDs', function () {
    $review = app(ItemDuplicateService::class)->check($this->municipalId, 'Premium rice', 'kg');
    $candidate = Item::create(['municipal_id' => $this->municipalId, 'code' => 'P', 'name' => 'Rice premium', 'base_unit' => 'kg', 'is_active' => false]);
    $data = ['name' => 'Premium rice', 'reviewed_item_ids' => $review['reviewed_item_ids'], 'duplicate_reason' => 'Distinct grade'];
    itemCatalogError(fn () => saveCatalogItem($this, $data), 'reviewed_item_ids');
    $data['reviewed_item_ids'][] = $candidate->id;
    $candidate->update(['name' => 'Sugar']);
    itemCatalogError(fn () => saveCatalogItem($this, $data), 'reviewed_item_ids');
    itemCatalogError(fn () => saveCatalogItem($this, [...$data, 'reviewed_item_ids' => [$this->item->id, $this->item->id]]), 'reviewed_item_ids');
    expect(StockMovement::count())->toBe(0);
});

it('rejects stale review IDs even when the current candidate set is empty and excludes the edited item', function () {
    expect(app(ItemDuplicateService::class)->check($this->municipalId, 'Rice', 'kg', $this->item->id)['matches'])->toBe([]);
    itemCatalogError(fn () => saveCatalogItem($this, ['name' => 'Soap', 'reviewed_item_ids' => [$this->item->id], 'duplicate_reason' => 'Different product']), 'reviewed_item_ids');
    expect(StockMovement::count())->toBe(0);
});

it('allows unchanged legacy identities to be deactivated but checks identity edits', function () {
    Item::create(['municipal_id' => $this->municipalId, 'code' => 'LEGACY', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true]);
    saveCatalogItem($this, ['code' => 'RICE', 'name' => 'Rice', 'description' => 'Corrected description', 'is_active' => false], $this->item->id);
    expect($this->item->fresh()->is_active)->toBeFalse();
    expect($this->item->fresh()->name)->toBe('Rice');
    itemCatalogError(fn () => saveCatalogItem($this, ['code' => 'RICE', 'name' => 'RICE!'], $this->item->id), 'name');
    itemCatalogError(fn () => saveCatalogItem($this, ['code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'piece'], $this->item->id), 'reviewed_item_ids');
    expect(StockMovement::count())->toBe(0);
});

it('verifies tenant IDs and does not expose foreign candidates or search records', function () {
    $foreign = Item::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'FOREIGN', 'name' => 'Foreign item', 'base_unit' => 'kg', 'is_active' => true]);
    $program = Program::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'FOREIGN', 'name' => 'Foreign program', 'is_active' => true]);
    itemCatalogError(fn () => app(ItemDuplicateService::class)->check($this->municipalId, 'Rice', 'kg', $foreign->id), 'exclude_id');
    itemCatalogError(fn () => app(ItemLookupService::class)->search($this->municipalId, '', $program->id), 'program_id');
    expect(app(ItemDuplicateService::class)->check($this->municipalId, 'Foreign item', 'kg')['matches'])->toBe([]);
    expect(app(ItemLookupService::class)->search($this->municipalId, 'Foreign')->total())->toBe(0);
    saveCatalogItem($this, ['name' => 'Foreign item']);
    expect(StockMovement::count())->toBe(0);
});

it('ranks text before posted program history and excludes inactive items with stable pagination', function () {
    $alpha = Item::create(['municipal_id' => $this->municipalId, 'code' => 'ALPHA', 'name' => 'Alpha rice', 'base_unit' => 'kg', 'is_active' => true]);
    $beta = Item::create(['municipal_id' => $this->municipalId, 'code' => 'BETA', 'name' => 'Beta rice', 'base_unit' => 'kg', 'is_active' => true]);
    goodsReceipt($this, false, ['lines' => [['item_id' => $alpha->id, 'program_id' => $this->program->id, 'quantity' => '1']]]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $beta->id, 'program_id' => $this->program->id, 'quantity' => '1']]]);
    $lookup = app(ItemLookupService::class);
    $before = StockMovement::count();
    $results = $lookup->search($this->municipalId, 'rice', $this->program->id)->items();
    expect(array_column($results, 'id'))->toBe([$this->item->id, $beta->id, $alpha->id]);
    expect($results[0]['base_unit_locked'])->toBeFalse()->and($results[2]['base_unit_locked'])->toBeTrue();
    $beta->update(['is_active' => false]);
    for ($i = 0; $i < 23; $i++) {
        Item::create(['municipal_id' => $this->municipalId, 'code' => 'PAGE'.$i, 'name' => 'Item '.$i, 'base_unit' => 'piece', 'is_active' => true]);
    }
    $first = $lookup->search($this->municipalId);
    $second = $lookup->search($this->municipalId, '', null, 2);
    expect($first->total())->toBe(25)->and($first->count())->toBe(20)->and($second->count())->toBe(5);
    expect(array_intersect(array_column($first->items(), 'id'), array_column($second->items(), 'id')))->toBe([]);
    expect(StockMovement::count())->toBe($before);
});

it('exposes paginated lookup and duplicate check contracts through authorized requests', function () {
    goodsInventoryHttp($this, []);
    $this->getJson('/api/goods-distribution/items/search?q=rice')->assertOk()->assertJsonStructure(['data' => [['id', 'code', 'name', 'base_unit', 'category', 'description', 'is_active', 'base_unit_locked']], 'meta', 'links']);
    $this->postJson('/api/goods-distribution/items/check', ['name' => 'Rice', 'base_unit' => 'kg'])->assertForbidden();
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->postJson('/api/goods-distribution/items/check', ['name' => 'Premium rice', 'base_unit' => 'kg'])->assertOk()->assertJsonPath('data.matches.0.match_type', 'possible')->assertJsonPath('data.reviewed_item_ids', [$this->item->id]);
    $this->getJson('/api/goods-distribution/items/search?page=0')->assertUnprocessable()->assertJsonValidationErrors('page');
    $this->postJson('/api/goods-distribution/items/check', ['name' => 'Rice', 'base_unit' => 'invalid'])->assertUnprocessable()->assertJsonValidationErrors('base_unit');
    expect(StockMovement::count())->toBe(0);
});

it('accepts enum categories and keeps category optional without stock changes', function () {
    foreach (ItemCategory::cases() as $category) {
        $item = saveCatalogItem($this, ['name' => 'Product '.$category->value, 'code' => 'CAT_'.$category->value, 'category' => $category->value]);
        expect($item->category)->toBe($category->value);
    }
    expect(saveCatalogItem($this, ['name' => 'Blank category', 'code' => 'BLANK', 'category' => ''])->category)->toBeNull();
    itemCatalogError(fn () => saveCatalogItem($this, ['name' => 'Invalid category', 'code' => 'INVALID', 'category' => 'Foods']), 'category');
    expect(StockMovement::count())->toBe(0);
});

it('preserves only the edited record legacy category and allows replacement or clearing', function () {
    $this->item->update(['category' => 'Custom historical group']);
    $data = ['name' => 'Rice', 'code' => 'RICE', 'category' => 'Custom historical group', 'is_active' => false];
    expect(saveCatalogItem($this, $data, $this->item->id)->category)->toBe('Custom historical group');
    itemCatalogError(fn () => saveCatalogItem($this, [...$data, 'category' => 'Another custom group'], $this->item->id), 'category');
    expect(saveCatalogItem($this, [...$data, 'category' => 'food'], $this->item->id)->category)->toBe('food');
    itemCatalogError(fn () => saveCatalogItem($this, $data, $this->item->id), 'category');
    expect(saveCatalogItem($this, [...$data, 'category' => null], $this->item->id)->category)->toBeNull();
});

it('provides enum options to catalog and receiving pages and validates direct API category edits', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->getJson('/inventory-test/goods-distribution/items', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.itemCategories', ItemCategory::options());
    $this->getJson('/inventory-test/goods-distribution/stock-receipts/create', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.itemCategories', ItemCategory::options());
    $data = ['name' => 'Rice', 'code' => 'RICE', 'base_unit' => 'kg', 'is_active' => true, 'category' => 'bad'];
    $this->postJson('/api/goods-distribution/catalog/items', $data)->assertUnprocessable()->assertJsonValidationErrors('category');
    $this->patchJson('/api/goods-distribution/catalog/items/'.$this->item->id, $data)->assertUnprocessable()->assertJsonValidationErrors('category');
});
