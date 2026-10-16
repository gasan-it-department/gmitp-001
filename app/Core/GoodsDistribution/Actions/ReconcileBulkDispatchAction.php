<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\BulkDispatchDto;
use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\BulkDispatchReconciliation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\BulkDispatchAllocationService;
use App\Core\GoodsDistribution\Services\BulkDispatchService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class ReconcileBulkDispatchAction
{
    public function __construct(private readonly BulkDispatchService $bulk, private readonly BulkDispatchAllocationService $allocations,
        private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(BulkDispatchDto $dto, bool $reverse = false): BulkDispatch
    {
        $this->bulk->actor($dto->municipalId, $dto->actorId, $reverse ? 'correct' : 'reconcile');

        return DB::transaction(function () use ($dto, $reverse) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $dispatch = $this->bulk->record($dto->municipalId, $dto->dispatchId, true);
            $command = $reverse ? 'reverse-reconciliation' : 'reconcile';
            if ($this->bulk->operation($dispatch, $dto->actorId, $command, $dto->data)) {
                return $dispatch;
            }
            $this->bulk->version($dispatch, (int) ($dto->data['version'] ?? 0));
            if ($dispatch->status->value !== 'dispatched') {
                throw new \DomainException('Reopen a closed dispatch before correcting its reconciliation.');
            }
            if (BulkDispatchReconciliation::query()->where('municipal_id', $dto->municipalId)->where('operation_key', $dto->data['operation_key'])->exists()) {
                throw new \DomainException('Reconciliation operation key has already been used.');
            }
            $allocations = $this->allocations->lockedAllocations($dispatch)->keyBy('id');
            $before = $this->allocations->balances($dispatch, $allocations);
            $original = null;
            if ($reverse) {
                $reason = $this->bulk->reason($dto->data);
                $original = $dispatch->reconciliations()->whereKey($dto->data['reconciliation_id'])->with('lines')->firstOrFail();
                if ($original->kind === 'reversal' || $original->reversal()->exists()) {
                    throw new \DomainException('This reconciliation cannot be reversed again.');
                }
                $entries = $original->lines->map(fn ($line) => ['allocation_id' => $line->bulk_dispatch_stock_allocation_id,
                    'original_line_id' => $line->id, 'quantity' => $this->quantities->format(-$this->quantities->parse($line->quantity, $line->base_unit))])->all();
                $kind = 'reversal';
                $date = $original->occurred_on->toDateString();
                $reference = $original->reference;
            } else {
                $preview = $this->allocations->reconciliationPreview($dispatch, $dto->data, $allocations);
                if (! hash_equals($preview['fingerprint'], $dto->data['fingerprint'] ?? '')) {
                    throw new \DomainException('Reconciliation review changed. Review the batch quantities again.');
                }
                if ($preview['kind'] === 'return' && ! ($dto->data['usable_confirmed'] ?? false)) {
                    throw new \DomainException('Inspect and confirm the returned goods are fit for distribution.');
                }
                $entries = $preview['allocations'];
                $kind = $preview['kind'];
                $date = $preview['actual_on'];
                $reference = trim($dto->data['reference'] ?? '') ?: $dispatch->reference;
                $reason = trim($dto->data['notes'] ?? '') ?: ($kind === 'return' ? 'Unused goods returned' : 'Reported goods distributed');
            }
            $event = $dispatch->reconciliations()->create(['municipal_id' => $dto->municipalId, 'kind' => $kind, 'occurred_on' => $date,
                'posted_at' => now(), 'actor_user_id' => $dto->actorId, 'operation_key' => $dto->data['operation_key'], 'reference' => $reference,
                'notes' => $reason, 'usable_confirmed' => ! $reverse && $kind === 'return', 'reverses_reconciliation_id' => $original?->id]);
            foreach ($entries as $entry) {
                $allocation = $allocations->get($entry['allocation_id']);
                $line = $event->lines()->create(['municipal_id' => $dto->municipalId, 'bulk_dispatch_id' => $dispatch->id,
                    'stock_receipt_line_id' => $allocation->stock_receipt_line_id,
                    'bulk_dispatch_stock_allocation_id' => $allocation->id, 'base_unit' => $allocation->base_unit, 'quantity' => $entry['quantity']]);
                if ($kind === 'return' || $original?->kind === 'return') {
                    $batch = $allocation->batch;
                    $quantity = $this->quantities->parse($entry['quantity'], $allocation->base_unit, signed: true);
                    $after = $this->ledger->balance($batch) + $quantity;
                    if ($after < $this->ledger->reserved($batch) || $after > StockQuantityService::MAX || $batch->receipt->status !== 'posted') {
                        throw new \DomainException('Returned stock cannot be corrected because it is already consumed or reserved.');
                    }
                    $movement = $reverse ? StockMovement::query()->where('municipal_id', $dto->municipalId)->where('bulk_dispatch_reconciliation_line_id', $entry['original_line_id'])->firstOrFail() : null;
                    StockMovement::create(['municipal_id' => $dto->municipalId, 'stock_receipt_line_id' => $batch->id, 'base_unit' => $allocation->base_unit,
                        'quantity' => $entry['quantity'], 'type' => $reverse ? 'reversal' : 'bulk_return', 'bulk_dispatch_reconciliation_line_id' => $line->id,
                        'reverses_movement_id' => $movement?->id, 'operation_key' => 'bulk-return:'.$line->id,
                        'occurred_on' => $date, 'posted_at' => now(), 'actor_user_id' => $dto->actorId, 'reference' => $reference, 'reason' => $reason]);
                }
            }
            $after = $this->allocations->balances($dispatch, $allocations);
            if (collect($after)->contains(fn ($row) => $this->quantities->parse($row['with_staff'], $row['base_unit'], signed: true) < 0
                || $this->quantities->parse($row['reported_distributed'], $row['base_unit'], signed: true) < 0
                || $this->quantities->parse($row['returned'], $row['base_unit'], signed: true) < 0)) {
                throw new \DomainException('The reconciliation would create an invalid outstanding balance.');
            }
            $this->bulk->completeOperation($dispatch, $dto->actorId, $command, $dto->data);
            $this->ledger->audit($dispatch, $dto->actorId, $reverse ? 'Reversed bulk reconciliation' : 'Recorded bulk '.$kind,
                ['allocations' => $before], ['allocations' => $after, 'reconciliation_id' => $event->id, 'reference' => $reference, 'reason' => $reason]);

            return $dispatch->fresh();
        });
    }
}
