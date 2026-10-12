<?php

use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReverseStockAdjustmentAction;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\TransitionDistributionRequestAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\ProgramItem;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(fn () => goodsDistributionFixture($this));
afterEach(function () {
    $this->travelBack();
    goodsDistributionCleanup();
});

it('shows matching reserved and available amounts at item and batch detail', function () {
    goodsReceipt($this, true);
    goodsApproval($this, goodsRequest($this));
    $read = app(ReadGoodsInventoryAction::class);
    $details = $read->item($this->municipalId, $this->item->id, new InventoryFiltersDto);
    expect((string) $details['item']->reserved)->toBe('2.000')
        ->and((string) $details['batches']->first()->reserved)->toBe('2.000');
    $resource = (new \App\External\Api\Resources\GoodsDistribution\StockReceiptLineResource($details['batches']->first()))->resolve();
    expect($resource['balance'])->toBe('250.000')->and($resource['reserved'])->toBe('2.000')->and($resource['available'])->toBe('248.000');
});

it('ignores stale representative details when the recipient collects goods', function (bool $onBehalf) {
    goodsReceipt($this, true);
    $subject = $onBehalf ? HouseholdMember::create(['household_id' => $this->household->id,
        'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']) : null;
    $request = goodsApproval($this, goodsRequest($this, ['assisted_household_member_id' => $subject?->id]));
    $snapshot = $request->reviewed_snapshot;
    goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'collector_name' => 'Old Representative',
        'collector_relationship' => 'Parent', 'collector_id_type' => 'National ID', 'collector_id_last_four' => 'AB12']);
    $request->refresh();
    expect($request->collector_type)->toBe('recipient')->and($request->collector_name)->toBe($snapshot['subject']['name'])
        ->and($request->collector_relationship)->toBeNull()->and($request->collector_id_type)->toBeNull()
        ->and($request->collector_id_last_four)->toBeNull()->and($request->handover_snapshot)->toBe($snapshot)
        ->and($request->status->value)->toBe('released')->and(StockMovement::where('type', 'distribution')->count())->toBe(1);
})->with([false, true]);

it('preserves and trims valid representative evidence during release', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'collector_type' => 'representative',
        'collector_name' => '  Kenneth Solis  ', 'collector_relationship' => '  Son  ',
        'collector_id_type' => '  National ID  ', 'collector_id_last_four' => 'AB12']);
    $request->refresh();
    expect($request->collector_type)->toBe('representative')->and($request->collector_name)->toBe('Kenneth Solis')
        ->and($request->collector_relationship)->toBe('Son')->and($request->collector_id_type)->toBe('National ID')
        ->and($request->collector_id_last_four)->toBe('AB12')->and($request->status->value)->toBe('released');
});

it('still requires all representative evidence without consuming stock on failure', function (string $field) {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    $payload = [...goodsReleaseData($request), 'collector_type' => 'representative',
        'collector_name' => 'Kenneth Solis', 'collector_relationship' => 'Son', 'collector_id_type' => 'National ID', 'collector_id_last_four' => 'AB12'];
    $payload[$field] = ' ';
    expect(fn () => goodsTransition($this, $request, 'release', $payload))->toThrow(DomainException::class);
    expect($request->fresh()->status->value)->toBe('approved')->and(StockMovement::where('type', 'distribution')->count())->toBe(0)
        ->and($request->allocations()->where('status', 'reserved')->count())->toBe(1);
})->with(['collector_name', 'collector_relationship', 'collector_id_type', 'collector_id_last_four']);

it('rejects expired reserved batches without silently allocating a replacement', function () {
    $this->travelTo(now()->startOfDay()->addHours(10));
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id,
        'quantity' => '10', 'expires_on' => today()->toDateString()]]]);
    $request = goodsApproval($this, goodsRequest($this));
    goodsReceipt($this, true);
    $this->travel(1)->days();
    expect(fn () => goodsTransition($this, $request, 'release', goodsReleaseData($request)))->toThrow(DomainException::class);
    expect($request->fresh()->status->value)->toBe('approved')->and(StockMovement::where('type', 'distribution')->count())->toBe(0);
    expect($request->allocations()->where('status', 'reserved')->count())->toBe(1);
});

it('retains expired stock on hand but excludes it from available allocation totals', function () {
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => today()->subDay()->toDateString()]]]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '5']]]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '20']]]);
    goodsApproval($this, goodsRequest($this));
    $read = app(ReadGoodsInventoryAction::class);
    $stock = $read->inventory($this->municipalId, new InventoryFiltersDto)->first();
    expect((string) $stock->balance)->toBe('35.000')->and((string) $stock->reserved)->toBe('2.000')->and((string) $stock->available)->toBe('3.000');
    $details = $read->item($this->municipalId, $this->item->id, new InventoryFiltersDto);
    expect((string) $details['item']->available)->toBe('3.000');
});

it('rejects dates before approval or later than today', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    foreach ([today()->subDay()->toDateString(), today()->addDay()->toDateString()] as $date) {
        expect(fn () => goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'actual_release_on' => $date]))->toThrow(DomainException::class);
    }
    expect(StockMovement::where('type', 'distribution')->count())->toBe(0);
});

it('allows backdated handover after approval with separate posting timestamp', function () {
    $this->travelTo(now()->startOfDay()->addHours(10));
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    $day = today()->toDateString();
    $this->travel(2)->days();
    goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'actual_release_on' => $day]);
    $movement = StockMovement::where('type', 'distribution')->first();
    expect($movement->occurred_on->toDateString())->toBe($day)->and($movement->posted_at->toDateString())->toBe(today()->toDateString());
});

it('records a valid earlier handover after the reserved batch has since expired exactly once', function (string $handoverDate) {
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-09 10:00:00', 'Asia/Manila'));
    $batch = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id,
        'quantity' => '10', 'expires_on' => '2026-10-10']]])->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $allocation = $request->allocations()->first();
    $snapshot = $request->reviewed_snapshot;
    $approvedAt = $request->approved_at;
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-12 10:00:00', 'Asia/Manila'));
    $payload = ['version' => $request->version, 'operation_key' => (string) Str::uuid(),
        ...goodsReleaseData($request), 'actual_release_on' => $handoverDate];
    $dto = new DistributionRequestDto($this->municipalId, $this->actor->id, $payload, $request->id);
    app(TransitionDistributionRequestAction::class)->execute($dto, 'release');
    app(TransitionDistributionRequestAction::class)->execute($dto, 'release');
    $request->refresh();
    $movement = StockMovement::where('type', 'distribution')->sole();
    $ledger = app(StockLedgerService::class);
    expect($request->status->value)->toBe('released')->and($request->actual_release_on->toDateString())->toBe($handoverDate)
        ->and($request->released_at->toDateString())->toBe('2026-10-12')->and($request->approved_at->equalTo($approvedAt))->toBeTrue()
        ->and($request->handover_snapshot)->toBe($snapshot)->and($movement->occurred_on->toDateString())->toBe($handoverDate)
        ->and($movement->posted_at->toDateString())->toBe('2026-10-12')->and($movement->quantity)->toBe('-2.000')
        ->and($movement->stock_receipt_line_id)->toBe($batch->id)->and($movement->distribution_stock_allocation_id)->toBe($allocation->id)
        ->and($allocation->fresh()->status)->toBe('consumed')->and($ledger->balance($batch))->toBe(8000)
        ->and($ledger->reserved($batch))->toBe(0)->and($request->allocations()->count())->toBe(1)
        ->and(DB::table('activity_log')->where('description', 'Release goods request')->count())->toBe(1);
})->with(['2026-10-09', '2026-10-10']);

it('rejects a handover after expiry even when the handover is backdated', function (string $handoverDate) {
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-09 10:00:00', 'Asia/Manila'));
    $batch = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id,
        'quantity' => '10', 'expires_on' => '2026-10-10']]])->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $before = $request->fresh()->toArray();
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-12 10:00:00', 'Asia/Manila'));
    expect(fn () => goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'actual_release_on' => $handoverDate]))
        ->toThrow(DomainException::class);
    $ledger = app(StockLedgerService::class);
    expect($request->fresh()->toArray())->toBe($before)->and(StockMovement::where('type', 'distribution')->count())->toBe(0)
        ->and($ledger->balance($batch))->toBe(10000)->and($ledger->reserved($batch))->toBe(2000)
        ->and($request->allocations()->where('status', 'reserved')->count())->toBe(1)
        ->and(DB::table('activity_log')->where('description', 'Release goods request')->count())->toBe(0);
})->with(['2026-10-11', '2026-10-12']);

it('does not release a mixed-batch request if any reserved batch was expired on the handover date', function () {
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-09 10:00:00', 'Asia/Manila'));
    $early = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id,
        'quantity' => '1', 'expires_on' => '2026-10-09']]])->lines->first();
    $later = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id,
        'quantity' => '1', 'expires_on' => '2026-10-11']]])->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $allocations = $request->allocations()->orderBy('id')->get()->toArray();
    $this->travelTo(\Carbon\CarbonImmutable::parse('2026-10-12 10:00:00', 'Asia/Manila'));
    expect(fn () => goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'actual_release_on' => '2026-10-10']))
        ->toThrow(DomainException::class);
    $ledger = app(StockLedgerService::class);
    expect($request->fresh()->status->value)->toBe('approved')->and($request->allocations()->orderBy('id')->get()->toArray())->toBe($allocations)
        ->and(StockMovement::where('type', 'distribution')->count())->toBe(0)
        ->and($ledger->balance($early))->toBe(1000)->and($ledger->balance($later))->toBe(1000)
        ->and($ledger->reserved($early))->toBe(1000)->and($ledger->reserved($later))->toBe(1000);
});

it('uses exact kilograms but rejects fractional pieces and disabled program items', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this, ['lines' => [['item_id' => $this->item->id, 'quantity' => '0.125']]]));
    expect($request->allocations()->value('quantity'))->toBe('0.125');
    $item = Item::create(['municipal_id' => $this->municipalId, 'name' => 'Fan', 'code' => 'FAN', 'base_unit' => 'piece', 'is_active' => true]);
    ProgramItem::create(['municipal_id' => $this->municipalId, 'program_id' => $this->program->id, 'item_id' => $item->id, 'is_active' => true]);
    expect(fn () => goodsRequest($this, ['lines' => [['item_id' => $item->id, 'quantity' => '1.5']]]))->toThrow(DomainException::class);
    $unreviewed = goodsTransition($this, goodsRequest($this), 'review');
    $this->programItem->update(['is_active' => false]);
    expect(fn () => goodsTransition($this, $unreviewed, 'approve', ['recipient_reviewed' => true]))->toThrow(DomainException::class);
});

it('preserves previous allocations when correcting returned quantities', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    $first = $request->allocations()->first();
    $request = goodsTransition($this, $request, 'return', ['reason' => 'Change the rice quantity']);
    $data = distributionData($this, ['version' => $request->version, 'lines' => [['item_id' => $this->item->id, 'quantity' => '3']]]);
    $request = app(SaveDistributionRequestAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, $data, $request->id));
    $request = goodsApproval($this, goodsTransition($this, $request, 'resubmit'));
    expect($first->fresh()->status)->toBe('cancelled')->and($first->fresh()->quantity)->toBe('2.000');
    expect($request->allocations()->where('status', 'reserved')->value('quantity'))->toBe('3.000');
});

it('protects reservations from negative reversals and forbids generic release reversal', function () {
    $line = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1']]])->lines->first();
    $addition = app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Additional counted stock', 'COUNT', '2', 'add'));
    $request = goodsApproval($this, goodsRequest($this));
    $reverse = fn ($id) => app(ReverseStockAdjustmentAction::class)->execute($id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Reverse incorrect count', 'REV'));
    expect(fn () => $reverse($addition->id))->toThrow(DomainException::class);
    goodsTransition($this, $request, 'release', goodsReleaseData($request));
    expect(fn () => $reverse(StockMovement::where('type', 'distribution')->value('id')))->toThrow(DomainException::class);
});

it('requires both file version inspection and the specified physical copy', function () {
    Storage::fake('local');
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'ID',
        'evidence_mode' => 'both', 'physical_copy_requirement' => 'photocopy', 'is_required' => true, 'sort_order' => 0]);
    $action = app(ReviewDistributionDocumentAction::class);
    $verify = fn ($copy) => $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => $request->fresh()->version, 'status' => 'verified', 'presented_copy_type' => $copy], $request->id), $check->id);
    expect(fn () => $verify('photocopy'))->toThrow(DomainException::class);
    $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => $request->version], $request->id),
        $check->id, UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    expect(fn () => $verify('original'))->toThrow(DomainException::class);
    $verify('photocopy');
    goodsReceipt($this, true);
    $request = goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true]);
    expect(fn () => $verify('photocopy'))->toThrow(DomainException::class);
    expect($check->fresh()->current_media_id)->toBe($check->fresh()->inspected_media_id);
});

it('rolls back media storage failure without replacing inspected evidence', function () {
    Storage::fake('local');
    $request = goodsRequest($this);
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'ID',
        'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified', 'is_required' => true, 'sort_order' => 0]);
    $this->mock(\Spatie\MediaLibrary\MediaCollections\Filesystem::class, function ($mock) {
        $mock->shouldReceive('addCustomRemoteHeaders')->once()->with(['visibility' => 'private']);
        $mock->shouldReceive('add')->once()->andThrow(new RuntimeException('Simulated storage failure'));
    });
    expect(fn () => app(ReviewDistributionDocumentAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => 1], $request->id), $check->id, UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF")))->toThrow(RuntimeException::class);
    expect($check->fresh()->current_media_id)->toBeNull()->and($request->fresh()->version)->toBe(1)->and(DB::table('media')->count())->toBe(0);
});

it('enforces allocation tenant and one-outgoing-movement constraints', function () {
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this));
    $allocation = $request->allocations()->first();
    expect(fn () => DB::transaction(fn () => DB::table('gd_distribution_stock_allocations')->where('id', $allocation->id)
        ->update(['municipal_id' => $this->otherMunicipalId])))->toThrow(\Illuminate\Database\QueryException::class);
    goodsTransition($this, $request, 'release', goodsReleaseData($request));
    $copy = StockMovement::where('type', 'distribution')->first()->getAttributes();
    $copy['id'] = (string) Str::ulid();
    $copy['operation_key'] = 'duplicate-distribution';
    expect(fn () => DB::transaction(fn () => DB::table('gd_stock_movements')->insert($copy)))->toThrow(\Illuminate\Database\QueryException::class);
});

it('uses the configured private disk and rejects a public document disk', function () {
    Storage::fake('s3');
    $request = goodsRequest($this);
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'id', 'label' => 'ID',
        'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified', 'is_required' => true, 'sort_order' => 0]);
    $action = app(ReviewDistributionDocumentAction::class);
    $upload = fn () => $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => $request->fresh()->version], $request->id), $check->id,
        UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    config(['goods_distribution.document_disk' => 'public']);
    expect($upload)->toThrow(DomainException::class);
    expect(DB::table('media')->count())->toBe(0)->and($request->fresh()->version)->toBe(1);
    config(['goods_distribution.document_disk' => 's3']);
    $upload();
    expect($request->getFirstMedia('goods_documents')->disk)->toBe('s3');
});
