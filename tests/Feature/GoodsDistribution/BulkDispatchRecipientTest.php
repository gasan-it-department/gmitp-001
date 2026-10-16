<?php

use App\Core\GoodsDistribution\Actions\ReconcileBulkDispatchAction;
use App\Core\GoodsDistribution\Actions\SaveBulkDispatchRecipientAction;
use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Dto\BulkDispatchRecipientDto;
use App\Core\GoodsDistribution\Models\BulkDispatchRecipient;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkDispatchRecipientService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/BulkDispatchFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    $this->withoutVite();
    bulkFixture($this);
    goodsReceipt($this, true);
});
afterEach(function () {
    $this->travelBack();
    goodsDistributionCleanup();
});

function recipientCommandData($dispatch, array $changes = [], $record = null): array
{
    return [...($record ? ['recipient_version' => $record->version, 'operation_key' => (string) Str::uuid()] : ['submission_key' => (string) Str::uuid(), 'first_name' => 'Juan', 'last_name' => 'Suarez']),
        'version' => $dispatch->fresh()->version, ...$changes];
}

function saveBulkRecipient($test, $dispatch, array $changes = [], $record = null, string $command = 'create')
{
    return app(SaveBulkDispatchRecipientAction::class)->execute(new BulkDispatchRecipientDto($test->municipalId, $test->actor->id,
        $dispatch->id, recipientCommandData($dispatch, $changes, $record), $record?->id), $command);
}

it('records names before a report without inferring any details or changing stock', function () {
    $dispatch = bulkDepart($this);
    $batch = $this->item->receiptLines()->first();
    $record = saveBulkRecipient($this, $dispatch);
    expect($record->barangay)->toBeNull()->and($record->received_on)->toBeNull()->and($record->collector_name)->toBeNull()
        ->and($record->lines)->toHaveCount(0)->and(app(StockLedgerService::class)->balance($batch))->toBe(150000)
        ->and(app(StockLedgerService::class)->reserved($batch))->toBe(0)->and(StockMovement::count())->toBe(2)
        ->and(DistributionRequest::count())->toBe(0)->and(DB::table('gd_distribution_cooldowns')->count())->toBe(0)
        ->and(DB::table('ac_beneficiaries')->count())->toBe(1)->and(DB::table('ac_households')->count())->toBe(1)
        ->and($dispatch->fresh()->status->value)->toBe('dispatched')->and($dispatch->reconciliations()->count())->toBe(0);
});

it('stores separate names and derives display names through completion and reviewed corrections', function () {
    $dispatch = bulkDepart($this);
    foreach (['first_name', 'last_name'] as $field) {
        expect(fn () => saveBulkRecipient($this, $dispatch, [$field => '  ']))->toThrow(DomainException::class, 'first and last name');
    }
    $record = saveBulkRecipient($this, $dispatch, ['first_name' => '  Maria Elena  ', 'last_name' => '  de la Cruz  ']);
    expect(Schema::hasColumn('gd_bulk_dispatch_recipients', 'full_name'))->toBeFalse()
        ->and(array_key_exists('full_name', $record->getAttributes()))->toBeFalse()
        ->and($record->first_name)->toBe('Maria Elena')->and($record->last_name)->toBe('de la Cruz')
        ->and($record->middle_name)->toBeNull()->and($record->suffix)->toBeNull()->and($record->full_name)->toBe('Maria Elena de la Cruz');
    $record = saveBulkRecipient($this, $dispatch, ['middle_name' => '  Santos  ', 'suffix' => '  Jr.  '], $record, 'complete');
    expect($record->full_name)->toBe('Maria Elena Santos de la Cruz Jr.')
        ->and($record->normalized_name)->toBe('maria elena santos de la cruz jr');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['first_name' => 'Marie'], $record, 'complete'))->toThrow(DomainException::class, 'reviewed correction');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['last_name' => '', 'reason' => 'Correct the paper transcription'], $record, 'correct'))->toThrow(DomainException::class, 'first and last name');
    $record = saveBulkRecipient($this, $dispatch, ['first_name' => 'Marie', 'middle_name' => '', 'suffix' => null, 'reason' => 'Correct the paper transcription'], $record, 'correct');
    expect($record->full_name)->toBe('Marie de la Cruz')->and($record->middle_name)->toBeNull()->and($record->suffix)->toBeNull();
    $service = app(BulkDispatchRecipientService::class);
    expect($service->candidates($dispatch, 'Marie de la Cruz'))->toHaveCount(1)
        ->and($service->candidates($dispatch, 'Maria Elena Santos'))->toHaveCount(0);
});

it('shows 80 reported 60 documented and 20 without details independently of names only entries', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '80']]);
    $line = $dispatch->lines->first();
    saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => $line->id, 'quantity' => '60']],
        'collector_name' => 'Maria Suarez', 'collector_relationship' => 'Spouse', 'acknowledgement' => 'signature']);
    saveBulkRecipient($this, $dispatch, ['first_name' => 'Pedro', 'last_name' => 'Reyes']);
    $row = app(BulkDispatchRecipientService::class)->coverage($dispatch)[0];
    expect($row['reported_distributed'])->toBe('80.000')->and($row['recorded'])->toBe('60.000')->and($row['without_details'])->toBe('20.000')
        ->and($row['needs_review'])->toBeFalse()->and(StockMovement::count())->toBe(2);
    expect(fn () => saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => $line->id, 'quantity' => '20.001']]]))->toThrow(DomainException::class, 'exceed');
    expect(BulkDispatchRecipient::count())->toBe(2);
});

it('completes blanks but requires reviewed correction to change known details and keeps goods revisions', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '80']]);
    $record = saveBulkRecipient($this, $dispatch);
    $record = saveBulkRecipient($this, $dispatch, ['barangay' => 'Uno', 'lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '2.125']]], $record, 'complete');
    expect($record->lines->first()->quantity)->toBe('2.125');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['barangay' => 'Dos'], $record, 'complete'))->toThrow(DomainException::class, 'reviewed correction');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['lines' => []], $record, 'complete'))->toThrow(DomainException::class, 'reviewed correction');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['reason' => ' '], $record, 'correct'))->toThrow(DomainException::class);
    $record = saveBulkRecipient($this, $dispatch, ['barangay' => 'Dos', 'reason' => 'Correct the signed paper transcription',
        'lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '3']]], $record, 'correct');
    expect($record->barangay)->toBe('Dos')->and($record->allLines()->count())->toBe(2)->and($record->lines->first()->quantity)->toBe('3.000');
    $record = saveBulkRecipient($this, $dispatch, ['reason' => 'The same paper row was encoded twice'], $record, 'void');
    expect($record->status->value)->toBe('voided')->and($record->allLines()->count())->toBe(2)
        ->and(app(BulkDispatchRecipientService::class)->coverage($dispatch)[0]['recorded'])->toBe('0.000');
    expect(fn () => $record->delete())->toThrow(DomainException::class);
});

it('documents closed trips and inactive issued items without reopening or changing warehouse history', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '100']]);
    $dispatch = bulkCommand($this, $dispatch, 'close');
    $this->item->update(['is_active' => false, 'name' => 'Renamed rice']);
    $record = saveBulkRecipient($this, $dispatch, ['received_on' => today()->toDateString(),
        'lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '2']]]);
    expect($record->lines->first()->item_name_snapshot)->toBe('Rice')->and($dispatch->fresh()->status->value)->toBe('closed')
        ->and($dispatch->fresh()->closed_at->toIso8601String())->toBe($dispatch->closed_at->toIso8601String())->and(StockMovement::count())->toBe(2);
});

it('preserves recipient evidence when a report is reversed and permits gradual corrections of excess', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '80']]);
    $report = $dispatch->reconciliations()->where('kind', 'distribution')->first();
    $record = saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '60']]]);
    app(ReconcileBulkDispatchAction::class)->execute(new BulkDispatchDto($this->municipalId, $this->actor->id,
        ['version' => $dispatch->fresh()->version, 'operation_key' => (string) Str::uuid(), 'reconciliation_id' => $report->id, 'reason' => 'Incorrect paper distribution report'], $dispatch->id), true);
    $row = app(BulkDispatchRecipientService::class)->coverage($dispatch)[0];
    expect($row['needs_review'])->toBeTrue()->and($row['excess'])->toBe('60.000')->and($record->fresh()->lines->first()->quantity)->toBe('60.000');
    saveBulkRecipient($this, $dispatch, ['reason' => 'Correct the supporting paper quantities', 'lines' => []], $record, 'correct');
    expect(app(BulkDispatchRecipientService::class)->coverage($dispatch)[0]['needs_review'])->toBeFalse()->and(StockMovement::count())->toBe(2);
});

it('makes repeated submissions and corrections idempotent while rejecting conflicting keys and stale versions', function () {
    $dispatch = bulkDepart($this);
    $payload = recipientCommandData($dispatch);
    $dto = new BulkDispatchRecipientDto($this->municipalId, $this->actor->id, $dispatch->id, $payload);
    $record = app(SaveBulkDispatchRecipientAction::class)->execute($dto);
    expect(app(SaveBulkDispatchRecipientAction::class)->execute($dto)->id)->toBe($record->id)->and(BulkDispatchRecipient::count())->toBe(1);
    expect(fn () => app(SaveBulkDispatchRecipientAction::class)->execute(new BulkDispatchRecipientDto($this->municipalId, $this->actor->id,
        $dispatch->id, [...$payload, 'first_name' => 'Another', 'last_name' => 'Person'])))->toThrow(DomainException::class, 'different');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['version' => 1]))->toThrow(DomainException::class, 'changed');
    $data = recipientCommandData($dispatch, ['barangay' => 'Uno'], $record);
    $update = new BulkDispatchRecipientDto($this->municipalId, $this->actor->id, $dispatch->id, $data, $record->id);
    $action = app(SaveBulkDispatchRecipientAction::class);
    $action->execute($update, 'complete');
    $action->execute($update, 'complete');
    expect($record->fresh()->version)->toBe(2);
});

it('checks lifecycle dates quantity arithmetic membership and correction permissions', function () {
    expect(fn () => saveBulkRecipient($this, bulkDraft($this)))->toThrow(DomainException::class, 'departed');
    $dispatch = bulkDepart($this);
    expect(fn () => saveBulkRecipient($this, $dispatch, ['received_on' => today()->subDay()->toDateString()]))->toThrow(DomainException::class);
    expect(fn () => saveBulkRecipient($this, $dispatch, ['received_on' => today()->addDay()->toDateString()]))->toThrow(DomainException::class);
    foreach (['0', '-1', '1.2345'] as $amount) {
        expect(fn () => saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => $amount]]]))->toThrow(DomainException::class);
    }
    expect(fn () => saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => (string) Str::ulid(), 'quantity' => '1']]]))->toThrow(DomainException::class);
    $record = saveBulkRecipient($this, $dispatch);
    $this->actor->revokePermissionTo('goods_distribution.bulk_dispatches.correct');
    expect(fn () => saveBulkRecipient($this, $dispatch, ['reason' => 'Reviewed transcription error'], $record, 'void'))->toThrow(\Illuminate\Auth\Access\AuthorizationException::class);
});

it('uses actual backdated receipt dates and whole pieces', function () {
    $this->travelTo(now()->subDays(2)->startOfDay()->addHours(10));
    $item = Item::create(['municipal_id' => $this->municipalId, 'name' => 'Canned tuna', 'code' => 'TUNA', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $item->id, 'is_active' => true]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $item->id, 'program_id' => $this->program->id, 'quantity' => '20']]]);
    $dispatch = bulkDepart($this, null, ['lines' => [['item_id' => $item->id, 'quantity' => '10']]]);
    $dispatch = bulkReconcile($this, $dispatch, 'distribution', [['item_id' => $item->id, 'quantity' => '10']]);
    $actual = today()->toDateString();
    $this->travel(2)->days();
    expect(fn () => saveBulkRecipient($this, $dispatch, ['lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '1.5']]]))->toThrow(DomainException::class, 'whole');
    $record = saveBulkRecipient($this, $dispatch, ['received_on' => $actual, 'lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '2']]]);
    expect($record->received_on->toDateString())->toBe($actual)->and($record->lines->first()->quantity)->toBe('2.000');
});

it('lists partial records and warns about same or reordered names without enforcing identity uniqueness', function () {
    $dispatch = bulkDepart($this);
    saveBulkRecipient($this, $dispatch, ['first_name' => 'Juan', 'last_name' => 'Suárez', 'barangay' => 'Uno']);
    saveBulkRecipient($this, $dispatch, ['first_name' => 'Juan', 'middle_name' => 'Palomares', 'last_name' => 'Suárez', 'suffix' => 'Jr.', 'barangay' => 'Dos']);
    $service = app(BulkDispatchRecipientService::class);
    expect($service->candidates($dispatch, 'JUAN SUÁREZ'))->toHaveCount(2);
    expect($service->candidates($dispatch, 'Suárez, Juan'))->toHaveCount(2)
        ->and($service->listing($dispatch, ['search' => 'Juan Suárez'])->total())->toBe(2)
        ->and($service->listing($dispatch, ['search' => 'Suárez Juan'])->total())->toBe(2)
        ->and($service->listing($dispatch, ['search' => 'Palomares'])->total())->toBe(1)
        ->and($service->listing($dispatch, ['search' => 'Jr.'])->total())->toBe(1);
    foreach (range(1, 20) as $number) {
        saveBulkRecipient($this, $dispatch, ['first_name' => 'Person', 'last_name' => (string) $number]);
    }
    expect($service->listing($dispatch, [])->total())->toBe(22)->and($service->listing($dispatch, [])->count())->toBe(20)
        ->and($service->listing($dispatch, ['barangay' => 'Uno'])->total())->toBe(1)
        ->and($service->listing($dispatch, ['quantity_details' => 'recorded'])->total())->toBe(0);
});

it('shows recipient pages with GD access and keeps pending recipient schema isolated', function () {
    $dispatch = bulkDepart($this);
    goodsInventoryHttp($this, ['goods_distribution.bulk_dispatches.view', 'goods_distribution.bulk_dispatches.reconcile', 'goods_distribution.bulk_dispatches.correct']);
    $api = '/api/goods-distribution/bulk-dispatches/'.$dispatch->id.'/recipients';
    $payload = recipientCommandData($dispatch);
    $this->postJson($api, [...$payload, 'first_name' => ''])->assertUnprocessable()->assertJsonValidationErrors('first_name');
    $this->postJson($api, [...$payload, 'last_name' => null])->assertUnprocessable()->assertJsonValidationErrors('last_name');
    $this->postJson($api, [...$payload, 'full_name' => 'Juan Suarez'])->assertUnprocessable()->assertJsonValidationErrors('full_name');
    $id = $this->postJson($api, $payload)->assertOk()->assertJsonPath('data.received_on', null)->json('data.id');
    $this->getJson($api.'/'.$id)->assertOk()->assertJsonPath('data.full_name', 'Juan Suarez')
        ->assertJsonPath('data.first_name', 'Juan')->assertJsonPath('data.middle_name', null)->assertJsonPath('data.last_name', 'Suarez')->assertJsonPath('data.suffix', null);
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id.'?tab=recipients', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.recipientCounts.without_quantities', 1)->assertJsonPath('props.recipients.data.0.id', $id);
    $this->getJson($api.'/candidates?search=Juan%20Suarez')->assertOk()->assertJsonCount(1, 'data');
    $this->getJson($api.'?to='.today()->toDateString())->assertOk();
    $record = BulkDispatchRecipient::findOrFail($id);
    $this->patchJson($api.'/'.$id.'/complete', recipientCommandData($dispatch, ['barangay' => 'Uno', 'paper_row' => '0'], $record))
        ->assertOk()->assertJsonPath('data.paper_row', '0');
    $record->refresh();
    $this->patchJson($api.'/'.$id.'/correct', recipientCommandData($dispatch, ['suffix' => 'Sr', 'reason' => 'Correct name from the signed paper list'], $record))
        ->assertOk()->assertJsonPath('data.full_name', 'Juan Suarez Sr');
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id.'?tab=history', ['X-Inertia' => 'true'])
        ->assertOk()->assertJsonPath('props.history.data.0.properties.after.reason', 'Correct name from the signed paper list');
    $this->postJson($api, [...recipientCommandData($dispatch), 'beneficiary_id' => $this->filer->id])->assertUnprocessable();
    $this->actor->syncPermissions(['goods_distribution.access', 'goods_distribution.bulk_dispatches.view']);
    $this->getJson($api)->assertOk();
    $this->postJson($api, recipientCommandData($dispatch))->assertForbidden();
    $this->getJson($api.'/'.Str::ulid())->assertNotFound();
    app()->instance('municipal_id', $this->otherMunicipalId);
    $this->getJson($api.'/'.$id)->assertForbidden();
    app()->instance('municipal_id', $this->municipalId);
    Schema::dropIfExists('gd_bulk_dispatch_recipient_lines');
    Schema::dropIfExists('gd_bulk_dispatch_recipients');
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id.'?tab=goods', ['X-Inertia' => 'true'])->assertOk();
    $this->get('/inventory-test/goods-distribution/bulk-dispatches/'.$dispatch->id.'?tab=recipients', ['X-Inertia' => 'true'])->assertOk()->assertJsonPath('props.recipientReady', false);
});

it('serializes recipient saves against report correction without losing documentary history', function () {
    $dispatch = bulkReconcile($this, bulkDepart($this), 'distribution', [['item_id' => $this->item->id, 'quantity' => '80']]);
    $report = $dispatch->reconciliations()->where('kind', 'distribution')->first();
    $payload = recipientCommandData($dispatch, ['lines' => [['bulk_dispatch_line_id' => $dispatch->lines->first()->id, 'quantity' => '60']]]);
    $results = competingGoodsCommands($this, [
        ['command' => 'bulk-recipient', 'dispatch_id' => $dispatch->id, 'data' => $payload],
        ['command' => 'bulk-reconcile', 'dispatch_id' => $dispatch->id, 'reverse' => true, 'data' => ['version' => $dispatch->version,
            'operation_key' => (string) Str::uuid(), 'reconciliation_id' => $report->id, 'reason' => 'Concurrent correction of paper report']],
    ]);
    expect(count(array_filter($results, fn ($entry) => $entry['ok'])))->toBe(1)->and(StockMovement::count())->toBe(2);
    $row = app(BulkDispatchRecipientService::class)->coverage($dispatch)[0];
    expect($row['recorded'])->toBe($results[0]['ok'] ? '60.000' : '0.000');
});

it('returns one entry for identical simultaneous submissions and rejects competing stale saves', function () {
    $dispatch = bulkDepart($this);
    $command = ['command' => 'bulk-recipient', 'dispatch_id' => $dispatch->id, 'data' => recipientCommandData($dispatch)];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true])->and(array_unique(array_column($results, 'id')))->toHaveCount(1)
        ->and(BulkDispatchRecipient::count())->toBe(1);
    $version = $dispatch->fresh()->version;
    $results = competingGoodsCommands($this, [
        ['command' => 'bulk-recipient', 'dispatch_id' => $dispatch->id, 'data' => [...recipientCommandData($dispatch), 'version' => $version]],
        ['command' => 'bulk-recipient', 'dispatch_id' => $dispatch->id, 'data' => [...recipientCommandData($dispatch), 'version' => $version, 'first_name' => 'Pedro', 'last_name' => 'Reyes']],
    ]);
    expect(count(array_filter($results, fn ($entry) => $entry['ok'])))->toBe(1)->and(BulkDispatchRecipient::count())->toBe(2);
});

it('enforces tenant-aware recipient foreign keys without modifying stored evidence', function () {
    $dispatch = bulkDepart($this);
    $record = saveBulkRecipient($this, $dispatch);
    $attributes = $record->getAttributes();
    $attributes['id'] = (string) Str::ulid();
    $attributes['submission_key'] = (string) Str::uuid();
    $attributes['municipal_id'] = $this->otherMunicipalId;
    expect(fn () => DB::table('gd_bulk_dispatch_recipients')->insert($attributes))->toThrow(\Illuminate\Database\QueryException::class);
    expect(BulkDispatchRecipient::count())->toBe(1)->and($record->fresh()->full_name)->toBe('Juan Suarez');
});
