<?php

use App\Core\GoodsDistribution\Actions\PostStockReceiptAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockSource;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\Users\Enums\EnumPermissions;
use App\Core\Users\Models\Permission;
use App\Core\Users\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

function goodsInventoryFixture(object $test): void
{
    $database = DB::connection()->getDatabaseName();
    if ($database !== ':memory:' && ! str_starts_with($database, 'codex_gd_test_')) {
        throw new LogicException('Inventory fixtures require an isolated in-memory or codex_gd_test_ database.');
    }
    Schema::create('municipalities', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('slug')->nullable();
        $table->string('municipal_code')->nullable();
        $table->timestamps();
    });
    Schema::create('users', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->ulid('municipal_id')->nullable();
        $table->string('first_name');
        $table->string('last_name');
        $table->string('email')->nullable();
        $table->string('password')->nullable();
        $table->timestamp('deactivated_at')->nullable();
        $table->timestamps();
    });
    Schema::create('activity_log', function (Blueprint $table) {
        $table->bigIncrements('id');
        $table->string('log_name')->nullable();
        $table->text('description');
        $table->nullableUlidMorphs('subject');
        $table->nullableUlidMorphs('causer');
        $table->string('event')->nullable();
        $table->uuid('batch_uuid')->nullable();
        $table->json('properties')->nullable();
        $table->json('attribute_changes')->nullable();
        $table->timestamps();
    });
    Schema::create('permissions', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    Schema::create('roles', function (Blueprint $table) {
        $table->ulid('id')->primary();
        $table->string('name');
        $table->string('guard_name');
        $table->timestamps();
    });
    foreach (['model_has_permissions' => 'permission_id', 'model_has_roles' => 'role_id'] as $name => $key) {
        Schema::create($name, function (Blueprint $table) use ($key) {
            $table->ulid($key);
            $table->string('model_type');
            $table->ulid('model_id');
            $table->primary([$key, 'model_id', 'model_type']);
        });
    }
    Schema::create('role_has_permissions', function (Blueprint $table) {
        $table->ulid('permission_id');
        $table->ulid('role_id');
        $table->primary(['permission_id', 'role_id']);
    });
    foreach (glob(database_path('migrations/2026_10_06_*_create_gd_*_table.php')) as $path) {
        (require $path)->up();
    }
    activity()->enableLogging();
    $test->municipalId = (string) Str::ulid();
    $test->otherMunicipalId = (string) Str::ulid();
    DB::table('municipalities')->insert([
        ['id' => $test->municipalId, 'name' => 'Inventory Test', 'slug' => 'inventory-test', 'created_at' => now(), 'updated_at' => now()],
        ['id' => $test->otherMunicipalId, 'name' => 'Other Test', 'slug' => 'other-test', 'created_at' => now(), 'updated_at' => now()],
    ]);
    $test->actor = User::create(['id' => (string) Str::ulid(), 'municipal_id' => $test->municipalId, 'first_name' => 'Stock', 'last_name' => 'Staff']);
    app()->instance('municipal_id', $test->municipalId);
    app()->instance('current_municipality', \App\Core\Municipality\Models\Municipality::findOrFail($test->municipalId));
    $test->item = Item::create(['municipal_id' => $test->municipalId, 'code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true]);
    $test->source = StockSource::create(['municipal_id' => $test->municipalId, 'code' => 'DONOR', 'name' => 'Private donor', 'source_type' => 'private_donor', 'is_active' => true]);
    $test->location = StorageLocation::create(['municipal_id' => $test->municipalId, 'code' => 'STORAGE', 'name' => 'Rice storage', 'is_active' => true]);
    $test->program = Program::create(['municipal_id' => $test->municipalId, 'code' => 'FOOD', 'name' => 'Food Distribution', 'is_active' => true]);
    $test->programItem = ProgramItem::create(['municipal_id' => $test->municipalId, 'program_id' => $test->program->id, 'item_id' => $test->item->id, 'is_active' => true]);
    foreach (EnumPermissions::cases() as $permission) {
        Permission::firstOrCreate(['name' => $permission->value, 'guard_name' => 'web']);
    }
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
}

function goodsInventoryCleanup(): void
{
    $database = DB::connection()->getDatabaseName();
    if ($database !== ':memory:' && ! str_starts_with($database, 'codex_gd_test_')) {
        throw new LogicException('Inventory cleanup is restricted to isolated test databases.');
    }
    Schema::withoutForeignKeyConstraints(function () {
        foreach (array_reverse(glob(database_path('migrations/2026_10_06_*_create_gd_*_table.php'))) as $path) {
            (require $path)->down();
        }
        foreach (['role_has_permissions', 'model_has_permissions', 'model_has_roles', 'permissions', 'roles', 'activity_log', 'users', 'municipalities'] as $table) {
            Schema::dropIfExists($table);
        }
    });
    app(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();
}

function goodsReceiptData(object $test, array $overrides = []): array
{
    return array_replace([
        'kind' => 'receipt', 'stock_source_id' => $test->source->id, 'storage_location_id' => $test->location->id,
        'received_on' => today()->toDateString(), 'reference' => 'DELIVERY-1', 'notes' => null,
        'lines' => [['item_id' => $test->item->id, 'program_id' => $test->program->id, 'quantity' => '250', 'package_type' => 'sack', 'package_count' => 10, 'quantity_per_package' => '25']],
    ], $overrides);
}

function goodsReceipt(object $test, bool $posted = false, array $overrides = []): \App\Core\GoodsDistribution\Models\StockReceipt
{
    $data = goodsReceiptData($test, $overrides);
    foreach ($data['lines'] as $line) {
        if (! empty($line['program_id']) && Program::where('municipal_id', $test->municipalId)->whereKey($line['program_id'])->exists() && Item::where('municipal_id', $test->municipalId)->whereKey($line['item_id'])->exists()) {
            ProgramItem::firstOrCreate(['municipal_id' => $test->municipalId, 'program_id' => $line['program_id'], 'item_id' => $line['item_id']], ['is_active' => true]);
        }
    }
    $receipt = app(SaveStockReceiptAction::class)->execute(new StockReceiptDto($test->municipalId, $test->actor->id, $data));
    if ($posted) {
        app(PostStockReceiptAction::class)->execute($test->municipalId, $receipt->id, $test->actor->id, app(ReceiptFingerprintService::class)->make($receipt));
    }

    return $receipt->fresh(['lines.item', 'lines.program', 'source', 'location']);
}

function goodsInventoryHttp(object $test, array $capabilities): void
{
    $test->withoutMiddleware([
        \App\Http\Middleware\Municipality\SetMunicipalityContext::class,
        \App\Http\Middleware\Admin\AdminGuardMiddleware::class,
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
    $test->actingAs($test->actor);
    $test->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.inventory.view', ...$capabilities]);
}
