<?php

use App\Core\ActionCenter\Models\DocumentType;
use App\Core\ActionCenter\Models\HouseholdMember;
use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction;
use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReviewDistributionDocumentAction;
use App\Core\GoodsDistribution\Actions\SaveDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\SaveProgramDocumentRequirementsAction;
use App\Core\GoodsDistribution\Actions\TransitionDistributionRequestAction;
use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Dto\DistributionRequestDto;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

require_once __DIR__.'/../../Support/GoodsDistributionFixture.php';
beforeEach(fn () => goodsDistributionFixture($this));
afterEach(fn () => goodsDistributionCleanup());

it('reserves two kilograms without deducting stock and releases exactly once', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    $ledger = app(StockLedgerService::class);
    expect($ledger->balance($line))->toBe(250000)->and($ledger->reserved($line))->toBe(2000);
    $stock = app(ReadGoodsInventoryAction::class)->inventory($this->municipalId, new InventoryFiltersDto)->first();
    expect((string) $stock->reserved)->toBe('2.000');
    $payload = ['version' => $request->version, 'operation_key' => (string) Str::uuid(), ...goodsReleaseData($request)];
    $dto = new DistributionRequestDto($this->municipalId, $this->actor->id, $payload, $request->id);
    app(TransitionDistributionRequestAction::class)->execute($dto, 'release');
    app(TransitionDistributionRequestAction::class)->execute($dto, 'release');
    expect($ledger->balance($line))->toBe(248000)->and($ledger->reserved($line))->toBe(0)
        ->and(StockMovement::where('type', 'distribution')->count())->toBe(1)
        ->and($request->fresh()->status->value)->toBe('released');
    expect(fn () => $request->fresh()->update(['notes' => 'overwrite']))->toThrow(DomainException::class);
    expect(DB::table('activity_log')->where('description', 'Release goods request')->count())->toBe(1);
});

it('uses earliest expiry then FIFO without crossing program or storage', function () {
    $late = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '10', 'expires_on' => today()->addDays(20)->toDateString()]]]);
    $early = goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1', 'expires_on' => today()->addDays(5)->toDateString()]]]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '100', 'expires_on' => today()->subDay()->toDateString()]]]);
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'quantity' => '100']]]);
    $request = goodsApproval($this, goodsRequest($this));
    expect($request->allocations()->where('stock_receipt_line_id', $early->lines->first()->id)->value('quantity'))->toBe('1.000')
        ->and($request->allocations()->where('stock_receipt_line_id', $late->lines->first()->id)->value('quantity'))->toBe('1.000')
        ->and($request->allocations()->count())->toBe(2);
});

it('frees reservations on return and cancellation without physical stock movements', function () {
    $line = goodsReceipt($this, true)->lines->first();
    $request = goodsApproval($this, goodsRequest($this));
    goodsTransition($this, $request, 'return', ['reason' => 'Correct the item quantities']);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(0)->and(StockMovement::count())->toBe(1);
    $request = goodsTransition($this, $request, 'resubmit');
    $request = goodsApproval($this, $request);
    expect($request->approval_revision)->toBe(2)->and(DistributionStockAllocation::where('status', 'cancelled')->count())->toBe(1);
    goodsTransition($this, $request, 'cancel', ['reason' => 'Recipient withdrew request']);
    expect(app(StockLedgerService::class)->reserved($line))->toBe(0)->and(app(StockLedgerService::class)->balance($line))->toBe(250000);
});

it('protects reserved stock from adjustments and receipt voiding', function () {
    $receipt = goodsReceipt($this, true);
    $line = $receipt->lines->first();
    goodsApproval($this, goodsRequest($this));
    expect(fn () => app(AdjustStockAction::class)->execute($line->id, new StockAdjustmentDto($this->municipalId, $this->actor->id, (string) Str::uuid(), 'Remove all stock', 'ADJ', '250', 'remove')))->toThrow(DomainException::class);
    expect(fn () => app(VoidStockReceiptAction::class)->execute($this->municipalId, $receipt->id, $this->actor->id, 'Void receipt stock', true, true))->toThrow(DomainException::class);
});

it('does not inherit registry identity verification or block repeated household distributions', function () {
    goodsReceipt($this, true);
    $first = goodsApproval($this, goodsRequest($this));
    goodsTransition($this, $first, 'release', goodsReleaseData($first));
    $second = goodsApproval($this, goodsRequest($this));
    expect($second->status->value)->toBe('approved')->and($this->filer->identity_verified_at)->toBeNull();
    expect(app(ReadDistributionRequestsAction::class)->previous($second))->toHaveCount(1);
});

it('supports an unlinked assisted member and preserves handover identity after transfer', function () {
    $subject = HouseholdMember::create(['household_id' => $this->household->id, 'first_name' => 'Kenneth', 'last_name' => 'Solis', 'relationship' => 'child']);
    goodsReceipt($this, true);
    $request = goodsApproval($this, goodsRequest($this, ['assisted_household_member_id' => $subject->id]));
    goodsTransition($this, $request, 'release', [...goodsReleaseData($request), 'collector_type' => 'representative',
        'collector_name' => 'Susan Solis', 'collector_relationship' => 'Parent', 'collector_id_type' => 'National ID', 'collector_id_last_four' => 'AB12']);
    $subject->update(['is_active' => false]);
    expect($request->fresh()->handover_snapshot['subject']['name'])->toBe('Kenneth Solis')->and($request->fresh()->collector_name)->toBe('Susan Solis');
});

it('blocks stale identities versions and conflicting submission keys', function () {
    $data = distributionData($this);
    $dto = new DistributionRequestDto($this->municipalId, $this->actor->id, $data);
    $request = app(SaveDistributionRequestAction::class)->execute($dto);
    expect(app(SaveDistributionRequestAction::class)->execute($dto)->id)->toBe($request->id);
    expect(fn () => app(SaveDistributionRequestAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, [...$data, 'notes' => 'different'])))->toThrow(DomainException::class);
    goodsReceipt($this, true);
    $request = goodsApproval($this, $request);
    $this->member->update(['first_name' => 'Changed']);
    expect(fn () => goodsTransition($this, $request, 'release', goodsReleaseData($request)))->toThrow(DomainException::class);
    expect(fn () => app(TransitionDistributionRequestAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => 1, 'operation_key' => (string) Str::uuid()], $request->id), 'cancel'))->toThrow(DomainException::class);
});

it('rolls back insufficient allocations and excludes expired batches', function () {
    goodsReceipt($this, true, ['lines' => [['item_id' => $this->item->id, 'program_id' => $this->program->id, 'quantity' => '1']]]);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    expect(fn () => goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true]))->toThrow(DomainException::class);
    expect(DistributionStockAllocation::count())->toBe(0)->and($request->fresh()->status->value)->toBe('under_review');
});

it('freezes document requirements and requires independent inspection', function () {
    $type = DocumentType::create(['key' => 'indigency', 'label' => 'Indigency', 'is_active' => true]);
    $read = app(ReadDistributionRequestsAction::class);
    $settings = $read->requirements($this->municipalId, $this->program->id);
    app(SaveProgramDocumentRequirementsAction::class)->execute($this->municipalId, $this->actor->id, $this->program->id, [
        'requirements_fingerprint' => $settings['requirements_fingerprint'],
        'requirements' => [['document_type_id' => $type->id, 'is_required' => true, 'evidence_mode' => 'physical', 'physical_copy_requirement' => 'original']],
    ]);
    $request = goodsTransition($this, goodsRequest($this), 'review');
    app(SaveProgramDocumentRequirementsAction::class)->execute($this->municipalId, $this->actor->id, $this->program->id, [
        'requirements_fingerprint' => $read->requirements($this->municipalId, $this->program->id)['requirements_fingerprint'], 'requirements' => [],
    ]);
    goodsReceipt($this, true);
    expect(fn () => goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true]))->toThrow(DomainException::class);
    $check = $request->documentChecks()->first();
    app(ReviewDistributionDocumentAction::class)->execute(new DistributionRequestDto($this->municipalId, $this->actor->id,
        ['version' => $request->version, 'status' => 'verified', 'presented_copy_type' => 'original'], $request->id), $check->id);
    $request = goodsTransition($this, $request, 'approve', ['recipient_reviewed' => true]);
    expect($request->documentChecks()->count())->toBe(1)->and(goodsRequest($this)->documentChecks()->count())->toBe(0);
});

it('stores uploads privately and resets inspection on replacement', function () {
    Storage::fake('local');
    $request = goodsTransition($this, goodsRequest($this), 'review');
    $check = $request->documentChecks()->create(['municipal_id' => $this->municipalId, 'document_key' => 'proof', 'label' => 'Proof',
        'is_required' => true, 'evidence_mode' => 'upload', 'physical_copy_requirement' => 'unspecified', 'sort_order' => 0]);
    $action = app(ReviewDistributionDocumentAction::class);
    $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => $request->version], $request->id), $check->id, UploadedFile::fake()->createWithContent('proof.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    $request->refresh();
    $check->refresh();
    $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => $request->version, 'status' => 'verified'], $request->id), $check->id);
    $request->refresh();
    $action->execute(new DistributionRequestDto($this->municipalId, $this->actor->id, ['version' => $request->version], $request->id), $check->id, UploadedFile::fake()->createWithContent('replacement.pdf', "%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF"));
    expect($check->fresh()->status)->toBe('pending')->and($check->fresh()->inspected_media_id)->toBeNull();
    expect(app(ReadDistributionRequestsAction::class)->document($this->municipalId, $request->id, $check->id)->disk)->toBe('local');
});
