<?php

use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\StockMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(fn () => goodsInventoryFixture($this));
afterEach(fn () => goodsInventoryCleanup());

it('creates sequential municipality-local codes without requesting a code', function (string $kind, string $prefix, array $details) {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $url = '/api/goods-distribution/catalog/'.$kind;
    $first = $this->postJson($url, ['name' => 'First record', 'is_active' => true, ...$details])
        ->assertOk()->assertJsonPath('data.code', $prefix.'-000001');
    $this->postJson($url, ['name' => 'Second record', 'is_active' => false, 'code' => 'CLIENT-CODE', ...$details])
        ->assertOk()->assertJsonPath('data.code', $prefix.'-000002');
    $this->patchJson($url.'/'.$first->json('data.id'), ['name' => 'Renamed record', 'is_active' => true, 'code' => 'CHANGED-CODE', ...$details])
        ->assertOk()->assertJsonPath('data.code', $prefix.'-000001');
    $this->postJson($url, ['name' => 'Third record', 'is_active' => true, ...$details])
        ->assertOk()->assertJsonPath('data.code', $prefix.'-000003');
    expect(StockMovement::count())->toBe(0);
})->with([
    'items' => ['items', 'ITM', ['base_unit' => 'piece']],
    'programs' => ['programs', 'PRG', []],
    'sources' => ['sources', 'SRC', ['source_type' => 'lgu']],
    'locations' => ['locations', 'LOC', []],
]);

it('preserves existing legacy codes in API and Core edits', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->patchJson('/api/goods-distribution/catalog/programs/'.$this->program->id, [
        'name' => 'Renamed program', 'is_active' => true, 'code' => 'REPLACEMENT',
    ])->assertOk()->assertJsonPath('data.code', $this->program->code);
    $record = app(ManageCatalogAction::class)->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items,
        ['name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true, 'code' => 'OVERRIDE'], $this->item->id));
    expect($record->code)->toBe('RICE')->and($record->name)->toBe('Rice');
    $audit = json_decode(DB::table('activity_log')->where('subject_id', $record->id)->value('properties'), true);
    expect($audit['before']['code'])->toBe('RICE')->and($audit['after']['code'])->toBe('RICE');
});

it('skips existing generated codes including inactive records without using another tenant sequence', function () {
    Item::create(['municipal_id' => $this->municipalId, 'code' => 'ITM-000015', 'name' => 'Existing item', 'base_unit' => 'piece', 'is_active' => false]);
    Item::create(['municipal_id' => $this->municipalId, 'code' => 'ITM-CUSTOM', 'name' => 'Legacy item', 'base_unit' => 'piece', 'is_active' => true]);
    Item::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'ITM-999999', 'name' => 'Foreign item', 'base_unit' => 'piece', 'is_active' => true]);
    $action = app(ManageCatalogAction::class);
    $data = ['name' => 'Fresh product', 'base_unit' => 'piece', 'is_active' => true];
    expect($action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, $data))->code)->toBe('ITM-000016');
    app()->instance('municipal_id', $this->otherMunicipalId);
    expect($action->execute(new CatalogDto($this->otherMunicipalId, $this->actor->id, CatalogKind::Items, $data))->code)->toBe('ITM-1000000');
});

it('does not consume a code when duplicate validation rolls back creation', function () {
    $action = app(ManageCatalogAction::class);
    $data = ['name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true];
    expect(fn () => $action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, $data)))
        ->toThrow(ValidationException::class);
    expect($action->execute(new CatalogDto($this->municipalId, $this->actor->id, CatalogKind::Items, [...$data, 'name' => 'Soap']))->code)
        ->toBe('ITM-000001');
});

it('generates a code through program-scoped inline item creation', function () {
    goodsInventoryHttp($this, ['goods_distribution.inventory.manage']);
    $this->postJson('/api/goods-distribution/programs/'.$this->program->id.'/items/create', [
        'name' => 'Electric fan', 'base_unit' => 'piece', 'is_active' => true,
    ])->assertOk()->assertJsonPath('data.code', 'ITM-000001');
    expect(StockMovement::count())->toBe(0);
});
