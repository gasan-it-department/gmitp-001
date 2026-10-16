<?php

use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
require_once __DIR__.'/../../Support/GoodsConcurrency.php';

beforeEach(function () {
    if (DB::getDriverName() !== 'pgsql') {
        $this->markTestSkipped('Requires disposable PostgreSQL.');
    }
    goodsDistributionFixture($this);
});
afterEach(function () {
    if (DB::getDriverName() === 'pgsql') {
        goodsDistributionCleanup();
    }
});

function distributionWorker($request, string $transition, array $data = []): array
{
    return ['command' => 'distribution', 'transition' => $transition, 'request_id' => $request->id,
        'data' => ['version' => $request->version, 'operation_key' => (string) Str::uuid(), ...$data]];
}

it('rechecks cooldowns under lock when two eligible requests release concurrently', function () {
    $this->program->update(['cooldown_enabled' => true, 'cooldown_scope' => 'household', 'cooldown_duration' => 2, 'cooldown_unit' => 'weeks']);
    goodsReceipt($this, true);
    $cooldowns = app(\App\Core\GoodsDistribution\Services\DistributionCooldownService::class);
    $a = goodsTransition($this, goodsRequest($this), 'review');
    $b = goodsTransition($this, goodsRequest($this), 'review');
    $a = goodsTransition($this, $a, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $cooldowns->context($a, today()->toDateString())['fingerprint']]);
    $b = goodsTransition($this, $b, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $cooldowns->context($b, today()->toDateString())['fingerprint']]);
    $results = competingGoodsCommands($this, [distributionWorker($a, 'release', goodsReleaseData($a)), distributionWorker($b, 'release', goodsReleaseData($b))]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1)
        ->and(\App\Core\GoodsDistribution\Models\DistributionCooldown::count())->toBe(1)
        ->and(StockMovement::where('type', 'distribution')->count())->toBe(1)
        ->and(DistributionStockAllocation::where('status', 'reserved')->count())->toBe(1);
});

it('records one cooldown for identical concurrent release retries', function () {
    $this->program->update(['cooldown_enabled' => true, 'cooldown_scope' => 'recipient', 'cooldown_duration' => 3, 'cooldown_unit' => 'months']);
    goodsReceipt($this, true);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $context = app(\App\Core\GoodsDistribution\Services\DistributionCooldownService::class)->context($request, today()->toDateString());
    $request = goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true, 'cooldown_fingerprint' => $context['fingerprint']]);
    $command = distributionWorker($request, 'release', goodsReleaseData($request));
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true])
        ->and(\App\Core\GoodsDistribution\Models\DistributionCooldown::count())->toBe(1)
        ->and(StockMovement::where('type', 'distribution')->count())->toBe(1);
});

it('serializes competing approvals without over-reserving the last stock', function () {
    $line = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '3']]])->lines->first();
    $a = goodsTransition($this, goodsRequest($this), 'review');
    $b = goodsTransition($this, goodsRequest($this), 'review');
    $results = competingGoodsCommands($this, [distributionWorker($a, 'approve', ['recipient_reviewed' => true]), distributionWorker($b, 'approve', ['recipient_reviewed' => true])]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(2000)->and(DistributionStockAllocation::count())->toBe(1);
});

it('serializes duplicate releases and records one handover movement', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $command = distributionWorker($request, 'release', goodsReleaseData($request));
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true]);
    expect(StockMovement::where('type', 'distribution')->count())->toBe(1)->and(app(StockLedgerService::class)->balance($line))->toBe(248000);
});

it('makes cancellation and release mutually exclusive', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $results = competingGoodsCommands($this, [
        distributionWorker($request, 'cancel', ['reason' => 'Recipient withdrew request']),
        distributionWorker($request, 'release', goodsReleaseData($request)),
    ]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(0);
    $released = $request->fresh()->status->value === 'released';
    expect(StockMovement::where('type', 'distribution')->count())->toBe($released ? 1 : 0);
    expect(app(StockLedgerService::class)->balance($line))->toBe($released ? 248000 : 250000);
});

it('protects stock when approval competes with removal or receipt voiding', function (string $command) {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $stock = $command === 'void'
        ? ['command' => 'void', 'receipt_id' => $receipt->id]
        : ['command' => 'adjust', 'line_id' => $line->id, 'quantity' => '250', 'direction' => 'remove', 'key' => (string) Str::uuid()];
    $results = competingGoodsCommands($this, [distributionWorker($request, 'approve', ['recipient_reviewed' => true]), $stock]);
    expect(count(array_filter($results, fn ($r) => $r['ok'])))->toBe(1);
    expect(app(StockLedgerService::class)->balance($line))->toBeGreaterThanOrEqual(app(StockLedgerService::class)->reserved($line));
})->with(['adjust', 'void']);

it('serializes identical household syncs without duplicate audits', function () {
    $request = goodsRequest($this)->refresh();
    $this->household->update(['street' => 'Updated street']);
    $command = ['command' => 'sync-household', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'household_reviewed' => true,
        'registry_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionHouseholdService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true], json_encode($results))->and($request->fresh()->version)->toBe(2)
        ->and(DB::table('activity_log')->where('description', 'Synced goods request household')->count())->toBe(1);
});

it('requires re-review when household sync competes with approval', function () {
    goodsReceipt($this, true);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $this->member->update(['relationship' => 'parent']);
    $sync = ['command' => 'sync-household', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'household_reviewed' => true,
        'registry_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionHouseholdService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$sync, distributionWorker($request, 'approve', ['recipient_reviewed' => true])]);
    expect(array_column($results, 'ok'))->toBe([true, false])->and($request->fresh()->status->value)->toBe('under_review')
        ->and(DistributionStockAllocation::count())->toBe(0);
});

it('serializes identical checklist updates without duplicate checks or audits', function () {
    $request = goodsRequest($this)->refresh();
    $type = \App\Core\ActionCenter\Models\DocumentType::create(['key' => 'id', 'label' => 'ID', 'is_active' => true]);
    \App\Core\GoodsDistribution\Models\ProgramDocumentRequirement::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id,
        'document_type_id' => $type->id, 'is_required' => true, 'evidence_mode' => 'physical', 'physical_copy_requirement' => 'original', 'sort_order' => 0]);
    $command = ['command' => 'apply-requirements', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'changes_reviewed' => true,
        'requirements_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionRequirementsService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true], json_encode($results))->and($request->fresh()->version)->toBe(2)
        ->and($request->documentChecks()->count())->toBe(1)
        ->and(DB::table('activity_log')->where('description', 'Applied updated goods document requirements')->count())->toBe(1);
});

it('serializes checklist updates against approval without approving uninspected additions', function () {
    goodsReceipt($this, true);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $type = \App\Core\ActionCenter\Models\DocumentType::create(['key' => 'id', 'label' => 'ID', 'is_active' => true]);
    \App\Core\GoodsDistribution\Models\ProgramDocumentRequirement::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id,
        'document_type_id' => $type->id, 'is_required' => true, 'evidence_mode' => 'physical', 'physical_copy_requirement' => 'original', 'sort_order' => 0]);
    $apply = ['command' => 'apply-requirements', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'operation_key' => (string) Str::uuid(), 'changes_reviewed' => true,
        'requirements_fingerprint' => app(\App\Core\GoodsDistribution\Services\DistributionRequirementsService::class)->preview($request)['fingerprint'],
    ]];
    $results = competingGoodsCommands($this, [$apply, distributionWorker($request, 'approve', ['recipient_reviewed' => true])]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1);
    $applied = $results[0]['ok'];
    expect($request->fresh()->status->value)->toBe($applied ? 'under_review' : 'approved')
        ->and($request->documentChecks()->count())->toBe($applied ? 1 : 0)
        ->and($request->allocations()->where('status', 'reserved')->count())->toBe($applied ? 0 : 1);
});

it('serializes duplicate draft submissions with one status change and no reservation', function () {
    $request = goodsRequest($this, ['intent' => 'draft'])->refresh();
    $command = distributionWorker($request, 'submit');
    $results = competingGoodsCommands($this, [$command, $command]);
    expect(array_column($results, 'ok'))->toBe([true, true], json_encode($results))
        ->and($request->fresh()->status->value)->toBe('pending')->and($request->fresh()->version)->toBe(2)
        ->and(DistributionStockAllocation::count())->toBe(0)
        ->and(DB::table('activity_log')->where('description', 'Submit goods request')->count())->toBe(1);
});

it('protects draft submission from a concurrent incomplete save', function () {
    $request = goodsRequest($this, ['intent' => 'draft'])->refresh();
    $save = ['command' => 'save-distribution', 'request_id' => $request->id, 'data' => [
        'version' => $request->version, 'intent' => 'draft', 'beneficiary_id' => $request->beneficiary_id,
        'assisted_household_member_id' => null, 'program_id' => $request->program_id,
        'storage_location_id' => $request->storage_location_id, 'lines' => [['item_id' => $this->item->id, 'quantity' => null]],
    ]];
    $results = competingGoodsCommands($this, [$save, distributionWorker($request, 'submit')]);
    expect(count(array_filter($results, fn ($result) => $result['ok'])))->toBe(1);
    $saved = $results[0]['ok'];
    expect($request->fresh()->status->value)->toBe($saved ? 'draft' : 'pending')
        ->and($request->lines()->first()->quantity)->toBe($saved ? null : '2.000')
        ->and(DistributionStockAllocation::count())->toBe(0);
});
