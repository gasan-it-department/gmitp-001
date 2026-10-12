<?php

use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsInventoryFixture.php';

beforeEach(function () {
    goodsInventoryFixture($this);
    DB::table('gd_program_items')->delete();
});
afterEach(fn () => goodsInventoryCleanup());

function programItemMembership(object $test, array $overrides = []): array
{
    return array_replace([
        'id' => (string) Str::ulid(),
        'municipal_id' => $test->municipalId,
        'program_id' => $test->program->id,
        'item_id' => $test->item->id,
        'is_active' => true,
        'created_at' => now(),
        'updated_at' => now(),
    ], $overrides);
}

it('shares an item across programs with independent active states and no stock changes', function () {
    $second = Program::create(['municipal_id' => $this->municipalId, 'code' => 'RELIEF', 'name' => 'Relief', 'is_active' => true]);
    $first = programItemMembership($this);
    DB::table('gd_program_items')->insert([
        $first,
        programItemMembership($this, ['program_id' => $second->id]),
    ]);
    DB::table('gd_program_items')->where('id', $first['id'])->update(['is_active' => false]);

    expect(DB::table('gd_program_items')->where('program_id', $second->id)->value('is_active'))->toBeTrue();
    expect($this->item->fresh()->is_active)->toBeTrue();
    expect(Item::count())->toBe(1)->and(StockMovement::count())->toBe(0);
});

it('prevents duplicate membership even after the existing association is deactivated', function () {
    DB::table('gd_program_items')->insert(programItemMembership($this, ['is_active' => false]));

    expect(fn () => DB::transaction(fn () => DB::table('gd_program_items')->insert(programItemMembership($this))))
        ->toThrow(QueryException::class);
    expect(DB::table('gd_program_items')->count())->toBe(1);
});

it('rejects cross-tenant or missing item and program references', function () {
    $foreignItem = Item::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true]);
    $foreignProgram = Program::create(['municipal_id' => $this->otherMunicipalId, 'code' => 'FOOD', 'name' => 'Foreign food', 'is_active' => true]);
    foreach ([
        ['item_id' => $foreignItem->id],
        ['program_id' => $foreignProgram->id],
        ['municipal_id' => $this->otherMunicipalId],
        ['item_id' => (string) Str::ulid()],
        ['program_id' => (string) Str::ulid()],
    ] as $invalid) {
        expect(fn () => DB::transaction(fn () => DB::table('gd_program_items')->insert(programItemMembership($this, $invalid))))
            ->toThrow(QueryException::class);
    }
    DB::table('gd_program_items')->insert(programItemMembership($this, [
        'municipal_id' => $this->otherMunicipalId,
        'item_id' => $foreignItem->id,
        'program_id' => $foreignProgram->id,
    ]));
    expect(DB::table('gd_program_items')->count())->toBe(1);
});

it('restricts deleting associated items and programs without changing existing stock history', function () {
    $receipt = goodsReceipt($this, true);
    $before = DB::table('gd_stock_movements')->get()->toJson();
    foreach (['gd_items' => $this->item->id, 'gd_programs' => $this->program->id] as $table => $id) {
        expect(fn () => DB::transaction(fn () => DB::table($table)->where('id', $id)->delete()))
            ->toThrow(QueryException::class);
    }
    expect(DB::table('gd_stock_movements')->get()->toJson())->toBe($before);
    expect($receipt->fresh()->status)->toBe('posted');
});

it('rolls back and recreates the association table without dropping existing inventory tables', function () {
    $migration = require database_path('migrations/2026_10_06_000008_create_gd_program_items_table.php');
    $migration->down();
    expect(Schema::hasTable('gd_program_items'))->toBeFalse();
    expect(Schema::hasTable('gd_items'))->toBeTrue()->and(Schema::hasTable('gd_stock_movements'))->toBeTrue();
    $migration->up();
    DB::table('gd_program_items')->insert(programItemMembership($this));
    expect(DB::table('gd_program_items')->count())->toBe(1);
});
