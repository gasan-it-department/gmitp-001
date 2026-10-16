<?php

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\Users\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    bulkFixture($this);
    $this->travelTo(now()->setDate(2026, 10, 15)->setTime(10, 0));
});

afterEach(function () {
    $this->travelBack();
    goodsDistributionCleanup();
});

dataset('distribution reference kinds', [
    'individual' => ['request', 'GD'],
    'bulk' => ['dispatch', 'BD'],
]);

function referenceData(object $test, string $kind, array $changes = []): array
{
    return $kind === 'request'
        ? distributionData($test, ['intent' => 'draft', 'lines' => [], ...$changes])
        : bulkData($test, ['lines' => [], ...$changes]);
}

function saveReferenceRecord(object $test, string $kind, array $data, ?string $id = null): mixed
{
    return $kind === 'request'
        ? app(SaveDistributionRequestAction::class)->execute(new DistributionRequestDto($test->municipalId, $test->actor->id, $data, $id))
        : app(SaveBulkDispatchAction::class)->execute(new BulkDispatchDto($test->municipalId, $test->actor->id, $data, $id));
}

function referenceModel(string $kind): string
{
    return $kind === 'request' ? DistributionRequest::class : BulkDispatch::class;
}

function referenceWorker(string $kind, array $data): array
{
    return ['command' => $kind === 'request' ? 'save-distribution' : 'bulk-save', 'data' => $data, 'test_now' => now()->toIso8601String()];
}

it('generates readable references while retaining ULID identities and ignoring client references', function (string $kind, string $prefix) {
    $data = referenceData($this, $kind, ['reference' => 'CLIENT-REFERENCE']);
    $first = saveReferenceRecord($this, $kind, $data);
    $second = saveReferenceRecord($this, $kind, referenceData($this, $kind));

    expect($first->reference)->toBe($prefix.'-2026-000001')
        ->and($second->reference)->toBe($prefix.'-2026-000002')
        ->and(Str::isUlid($first->id))->toBeTrue()
        ->and($second->id)->not->toBe($first->id)
        ->and($first->program_id)->toBe($this->program->id)
        ->and(StockMovement::count())->toBe(0);
})->with('distribution reference kinds');

it('preserves legacy references and existing IDs when a draft is edited', function (string $kind, string $prefix) {
    $data = referenceData($this, $kind);
    $record = saveReferenceRecord($this, $kind, $data);
    $legacy = $prefix.'-'.(string) Str::ulid();
    DB::table($record->getTable())->where('id', $record->id)->update(['reference' => $legacy]);
    $record->refresh();

    $updated = saveReferenceRecord($this, $kind, [...$data, 'version' => $record->version,
        'operation_key' => (string) Str::uuid(), 'reference' => 'REPLACE-ME', 'notes' => 'Interview completed'], $record->id);
    expect($updated->reference)->toBe($legacy)->and($updated->id)->toBe($record->id);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-000001');
})->with('distribution reference kinds');

it('returns the original reference on a submission retry without consuming a sequence number', function (string $kind, string $prefix) {
    $data = referenceData($this, $kind);
    $first = saveReferenceRecord($this, $kind, $data);
    $retry = saveReferenceRecord($this, $kind, $data);
    expect($retry->id)->toBe($first->id)->and($retry->reference)->toBe($first->reference);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-000002');
})->with('distribution reference kinds');

it('rolls back a failed creation without consuming its reference', function (string $kind, string $prefix) {
    $data = referenceData($this, $kind, ['lines' => [['item_id' => $this->item->id, 'quantity' => '0']]]);
    expect(fn () => saveReferenceRecord($this, $kind, $data))->toThrow(DomainException::class);
    $model = referenceModel($kind);
    expect($model::count())->toBe(0);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-000001');
})->with('distribution reference kinds');

it('starts a new annual sequence using the application timezone', function (string $kind, string $prefix) {
    $this->travelTo(now()->setDate(2026, 12, 31)->setTime(23, 59, 59));
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-000001');
    $this->travelTo(now()->addSecond());
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2027-000001');
})->with('distribution reference kinds');

it('retains cancelled numbers and continues beyond six digits without counting malformed references', function (string $kind, string $prefix) {
    $cancelled = saveReferenceRecord($this, $kind, referenceData($this, $kind));
    DB::table($cancelled->getTable())->where('id', $cancelled->id)->update(['reference' => $prefix.'-2026-999999', 'status' => 'cancelled']);
    $other = saveReferenceRecord($this, $kind, referenceData($this, $kind));
    expect($other->reference)->toBe($prefix.'-2026-1000000');
    DB::table($other->getTable())->where('id', $other->id)->update(['reference' => $prefix.'-2026-9999999999-invalid']);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-1000000');
})->with('distribution reference kinds');

it('keeps independent numbering for individual requests bulk dispatches and stock receipts', function () {
    expect(saveReferenceRecord($this, 'request', referenceData($this, 'request'))->reference)->toBe('GD-2026-000001')
        ->and(saveReferenceRecord($this, 'dispatch', referenceData($this, 'dispatch'))->reference)->toBe('BD-2026-000001')
        ->and(goodsReceipt($this)->receipt_number)->toBe('GR-2026-000001');
});

it('allows the same readable reference in different municipalities but rejects a duplicate in the same one', function (string $kind, string $prefix) {
    $first = saveReferenceRecord($this, $kind, referenceData($this, $kind));
    $permissions = $this->actor->getPermissionNames()->all();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $tenant = (object) ['municipalId' => $this->otherMunicipalId];
    $tenant->actor = User::create(['id' => (string) Str::ulid(), 'municipal_id' => $tenant->municipalId, 'first_name' => 'Other', 'last_name' => 'Staff']);
    $tenant->actor->givePermissionTo($permissions);
    $tenant->program = Program::create(['municipal_id' => $tenant->municipalId, 'code' => 'FOOD', 'name' => 'Other food program', 'is_active' => true]);
    $tenant->location = StorageLocation::create(['municipal_id' => $tenant->municipalId, 'code' => 'STORE', 'name' => 'Other warehouse', 'is_active' => true]);
    $tenant->item = Item::create(['municipal_id' => $tenant->municipalId, 'code' => 'RICE', 'name' => 'Rice', 'base_unit' => 'kg', 'is_active' => true]);
    $tenant->household = Household::create(['municipal_id' => $tenant->municipalId, 'household_code' => 'HH-OTHER']);
    $tenant->filer = Beneficiary::create(['municipal_id' => $tenant->municipalId, 'household_id' => $tenant->household->id,
        'first_name' => 'Maria', 'last_name' => 'Reyes', 'birth_date' => '1980-01-01', 'sex' => 'female']);
    HouseholdMember::create(['household_id' => $tenant->household->id, 'beneficiary_id' => $tenant->filer->id,
        'first_name' => 'Maria', 'last_name' => 'Reyes', 'birth_date' => '1980-01-01', 'sex' => 'female', 'relationship' => 'head']);
    $second = saveReferenceRecord($tenant, $kind, referenceData($tenant, $kind));
    expect($second->reference)->toBe($first->reference);

    $attributes = [...$second->getAttributes(), 'id' => (string) Str::ulid(), 'submission_key' => (string) Str::uuid()];
    expect(fn () => DB::transaction(fn () => DB::table($second->getTable())->insert($attributes)))->toThrow(QueryException::class);
    app()->instance('municipal_id', $this->municipalId);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-2026-000002');
})->with('distribution reference kinds');

it('serializes distinct simultaneous creations into consecutive unique references', function (string $kind, string $prefix) {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    $results = competingGoodsCommands($this, [
        referenceWorker($kind, referenceData($this, $kind)),
        referenceWorker($kind, referenceData($this, $kind)),
    ]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    $model = referenceModel($kind);
    $year = now()->format('Y');
    expect($model::query()->orderBy('reference')->pluck('reference')->all())->toBe([$prefix.'-'.$year.'-000001', $prefix.'-'.$year.'-000002']);
})->with('distribution reference kinds');

it('keeps one reference for identical simultaneous submission retries', function (string $kind, string $prefix) {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    $data = referenceData($this, $kind);
    $command = referenceWorker($kind, $data);
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true])->and($results[0]['id'])->toBe($results[1]['id']);
    expect(saveReferenceRecord($this, $kind, referenceData($this, $kind))->reference)->toBe($prefix.'-'.now()->format('Y').'-000002');
})->with('distribution reference kinds');
