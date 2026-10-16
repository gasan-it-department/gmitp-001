<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\BulkDispatch;
use App\Core\GoodsDistribution\Models\BulkDispatchReconciliationLine;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

final class BulkDispatchAllocationService
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities, private readonly BulkDispatchService $bulk) {}

    private function lockBatches(string $municipalId, array $ids): Collection
    {
        $receipts = StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', $ids)->pluck('stock_receipt_id')->unique()->sort()->values();
        StockReceipt::query()->where('municipal_id', $municipalId)->whereIn('id', $receipts)->orderBy('id')->lockForUpdate()->get();

        return StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', $ids)->with('receipt')->orderBy('id')->lockForUpdate()->get();
    }

    public function approvalPreview(BulkDispatch $dispatch, bool $lock = false): array
    {
        if ($dispatch->status->value !== 'draft') {
            throw new \DomainException('Only drafts can be reviewed for approval.');
        }
        $snapshot = $this->bulk->readySnapshot($dispatch);
        $entries = $this->propose($dispatch, $snapshot['lines'], $lock);

        return ['snapshot' => $snapshot, 'allocations' => $entries,
            'fingerprint' => $this->bulk->hash([$dispatch->id, $dispatch->version, $snapshot, $entries])];
    }

    public function propose(BulkDispatch $dispatch, array $lines, bool $lock = false): array
    {
        $query = StockReceiptLine::query()->where('municipal_id', $dispatch->municipal_id)->where('program_id', $dispatch->program_id)
            ->whereIn('item_id', array_column($lines, 'item_id'))
            ->where(fn ($query) => $query->whereNull('expires_on')->orWhere('expires_on', '>=', today()->toDateString()))
            ->whereHas('receipt', fn ($query) => $query->where('status', 'posted')->where('storage_location_id', $dispatch->storage_location_id)->where('received_on', '<=', today()->toDateString()));
        $batches = $lock ? $this->lockBatches($dispatch->municipal_id, $query->pluck('id')->all()) : $query->with('receipt')->get();
        $batches = $batches->sortBy(fn ($batch) => $this->batchOrder($batch));
        $entries = [];
        foreach ($lines as $values) {
            $line = (object) $values;
            $remaining = $this->quantities->parse($line->quantity, $line->base_unit);
            foreach ($batches->where('item_id', $line->item_id) as $batch) {
                if ($batch->base_unit !== $line->base_unit) {
                    throw new \DomainException('Stock and dispatch units do not agree.');
                }
                $available = max(0, $this->ledger->balance($batch) - $this->ledger->reserved($batch));
                $quantity = min($available, $remaining);
                if ($quantity > 0) {
                    $entries[] = ['line_id' => $line->id ?? null, 'batch_id' => $batch->id, 'item_id' => $line->item_id,
                        'item_name' => $line->item_name_snapshot, 'base_unit' => $line->base_unit, 'quantity' => $this->quantities->format($quantity),
                        ...$this->batchDetails($batch)];
                    $remaining -= $quantity;
                }
                if ($remaining === 0) {
                    break;
                }
            }
            if ($remaining > 0) {
                throw new \DomainException('Insufficient unexpired available stock for '.$line->item_name_snapshot.'.');
            }
        }

        return $entries;
    }

    public function batchDetails(StockReceiptLine $batch): array
    {
        return ['batch_reference' => $batch->batch_reference, 'receipt_reference' => $batch->receipt->receipt_number,
            'source_name' => $batch->receipt->source_name_snapshot, 'expires_on' => $batch->expires_on?->toDateString()];
    }

    public function lockedAllocations(BulkDispatch $dispatch): Collection
    {
        $ids = $dispatch->allocations()->whereIn('status', ['reserved', 'issued'])->pluck('stock_receipt_line_id')->all();
        $this->lockBatches($dispatch->municipal_id, $ids);
        $allocations = $dispatch->allocations()->whereIn('status', ['reserved', 'issued'])->orderBy('id')->lockForUpdate()->with(['batch.receipt', 'line'])->get();
        $dispatch->reconciliations()->orderBy('id')->lockForUpdate()->get();
        BulkDispatchReconciliationLine::query()->where('municipal_id', $dispatch->municipal_id)->where('bulk_dispatch_id', $dispatch->id)->orderBy('id')->lockForUpdate()->get();

        return $allocations;
    }

    public function cancelReservations(BulkDispatch $dispatch): void
    {
        foreach ($this->lockedAllocations($dispatch)->where('status', 'reserved') as $allocation) {
            $allocation->update(['status' => 'cancelled']);
        }
    }

    public function issue(BulkDispatch $dispatch, string $actorId, string $date, array $confirmed): void
    {
        $allocations = $this->lockedAllocations($dispatch)->where('status', 'reserved');
        $ids = $allocations->pluck('id')->sort()->values()->all();
        sort($confirmed);
        if (! $ids || $ids !== $confirmed) {
            throw new \DomainException('Confirm every reserved batch from the current approval.');
        }
        $dispatch->load('lines');
        foreach ($dispatch->lines as $line) {
            $allocated = $allocations->where('bulk_dispatch_line_id', $line->id)->sum(fn ($allocation) => $this->quantities->parse($allocation->quantity, $line->base_unit));
            if ($allocated !== $this->quantities->parse($line->quantity, $line->base_unit)) {
                throw new \DomainException('Reservations do not match the approved quantities.');
            }
        }
        foreach ($allocations as $allocation) {
            if ($allocation->approval_revision !== $dispatch->approval_revision) {
                throw new \DomainException('Reservations do not match the current approval.');
            }
        }
        $this->issueAllocations($dispatch, $allocations, $actorId, $date, $confirmed);
    }

    public function issueAllocations(BulkDispatch $dispatch, Collection $allocations, string $actorId, string $date, array $confirmed): void
    {
        $ids = $allocations->pluck('id')->sort()->values()->all();
        sort($confirmed);
        if (! $ids || $ids !== $confirmed || $allocations->contains(fn ($allocation) => $allocation->status !== 'reserved')) {
            throw new \DomainException('Confirm every reserved batch from the current approval.');
        }
        foreach ($allocations as $allocation) {
            $batch = $allocation->batch;
            if ($batch->receipt->status !== 'posted'
                || $batch->program_id !== $dispatch->program_id || $batch->receipt->storage_location_id !== $dispatch->storage_location_id
                || $batch->item_id !== $allocation->line->item_id || $batch->base_unit !== $allocation->base_unit
                || $batch->receipt->received_on->toDateString() > $date || ($batch->expires_on && $batch->expires_on->toDateString() < $date)
                || $this->ledger->balance($batch) < $this->ledger->reserved($batch)) {
                throw new \DomainException('A reserved batch is unavailable or expired. Cancel or withdraw this approval and review the stock again.');
            }
            StockMovement::create(['municipal_id' => $dispatch->municipal_id, 'stock_receipt_line_id' => $batch->id,
                'base_unit' => $allocation->base_unit, 'quantity' => $this->quantities->format(-$this->quantities->parse($allocation->quantity, $allocation->base_unit)),
                'type' => 'bulk_dispatch', 'bulk_dispatch_stock_allocation_id' => $allocation->id,
                'operation_key' => 'bulk-dispatch:'.$allocation->id, 'occurred_on' => $date, 'posted_at' => now(), 'actor_user_id' => $actorId,
                'reference' => $dispatch->reference, 'reason' => ($allocation->additional_issue_id ? 'Additional goods issued to ' : 'Goods issued to ').$dispatch->custodian_name]);
            $allocation->update(['status' => 'issued']);
        }
    }

    public function balances(BulkDispatch $dispatch, ?Collection $allocations = null): array
    {
        $allocations ??= $dispatch->allocations()->whereIn('status', ['reserved', 'issued'])->with(['batch.receipt', 'line'])->orderBy('id')->get();
        $events = $dispatch->reconciliations()->with(['lines', 'reversedEntry'])->get();
        $allocations->loadMissing('departure');
        $result = [];
        foreach ($allocations as $allocation) {
            $distributed = 0;
            $returned = 0;
            foreach ($events as $event) {
                $kind = $event->kind === 'reversal' ? $event->reversedEntry->kind : $event->kind;
                foreach ($event->lines->where('bulk_dispatch_stock_allocation_id', $allocation->id) as $line) {
                    $amount = $this->quantities->parse($line->quantity, $allocation->base_unit, signed: true);
                    if ($kind === 'distribution') {
                        $distributed += $amount;
                    } else {
                        $returned += $amount;
                    }
                }
            }
            $issued = $allocation->status === 'issued' ? $this->quantities->parse($allocation->quantity, $allocation->base_unit) : 0;
            $result[$allocation->id] = ['id' => $allocation->id, 'line_id' => $allocation->bulk_dispatch_line_id,
                'additional_issue_id' => $allocation->additional_issue_id, 'issued_on' => $allocation->departure?->occurred_on?->toDateString(),
                'batch_id' => $allocation->stock_receipt_line_id, 'item_id' => $allocation->line->item_id,
                'item_name' => $allocation->line->item_name_snapshot, 'base_unit' => $allocation->base_unit, 'status' => $allocation->status,
                'quantity' => $allocation->quantity, 'issued' => $this->quantities->format($issued),
                'reported_distributed' => $this->quantities->format($distributed), 'returned' => $this->quantities->format($returned),
                'with_staff' => $this->quantities->format($issued - $distributed - $returned), ...$this->batchDetails($allocation->batch)];
        }

        return $result;
    }

    public function eventDate(string $value, string $minimum): string
    {
        try {
            $date = CarbonImmutable::createFromFormat('!Y-m-d', $value)->toDateString();
        } catch (\Throwable) {
            throw new \DomainException('Enter a valid actual date.');
        }
        if ($date !== $value || $date < $minimum || $date > today()->toDateString()) {
            throw new \DomainException('Actual date must be between '.$minimum.' and today.');
        }

        return $date;
    }

    public function reconciliationPreview(BulkDispatch $dispatch, array $data, ?Collection $allocations = null): array
    {
        if ($dispatch->status->value !== 'dispatched' || ! in_array($data['kind'] ?? '', ['distribution', 'return'], true)) {
            throw new \DomainException('Reconcile an active dispatched record using distribution or unused return.');
        }
        $date = $this->eventDate($data['actual_on'] ?? '', $dispatch->actual_dispatch_on->toDateString());
        $allocations ??= $dispatch->allocations()->where('status', 'issued')->with(['batch.receipt', 'line'])->get();
        $balances = $this->balances($dispatch, $allocations);
        $inputs = $data['lines'] ?? [];
        $key = $data['kind'] === 'distribution' ? 'item_id' : 'allocation_id';
        if (! $inputs || count($inputs) > 100 || count(array_unique(array_column($inputs, $key))) !== count($inputs)) {
            throw new \DomainException('Enter distinct item totals or return batches.');
        }
        $entries = [];
        foreach ($inputs as $input) {
            $candidates = $allocations->filter(fn ($allocation) => $data['kind'] === 'return'
                ? $allocation->id === ($input['allocation_id'] ?? '') : $allocation->line->item_id === ($input['item_id'] ?? ''))
                ->sortBy(fn ($allocation) => $this->batchOrder($allocation->batch).'|'.$allocation->id);
            if ($candidates->isEmpty()) {
                throw new \DomainException('Select items or batches issued on this dispatch.');
            }
            $unit = $candidates->first()->base_unit;
            $remaining = $this->quantities->parse((string) ($input['quantity'] ?? ''), $unit);
            foreach ($candidates as $allocation) {
                $batch = $allocation->batch;
                if ($batch->receipt->status !== 'posted' || ($batch->expires_on && $batch->expires_on->toDateString() < $date)
                    || ($balances[$allocation->id]['issued_on'] ?? $dispatch->actual_dispatch_on->toDateString()) > $date) {
                    continue;
                }
                $available = $this->quantities->parse($balances[$allocation->id]['with_staff'], $unit);
                $quantity = min($remaining, $available);
                if ($quantity > 0) {
                    $entries[] = ['allocation_id' => $allocation->id, 'quantity' => $this->quantities->format($quantity),
                        'item_name' => $allocation->line->item_name_snapshot, 'base_unit' => $unit, ...$this->batchDetails($batch)];
                    $remaining -= $quantity;
                }
                if ($remaining === 0) {
                    break;
                }
            }
            if ($remaining > 0) {
                throw new \DomainException('Quantity exceeds the remaining unexpired goods on this dispatch.');
            }
        }
        if (! $entries) {
            throw new \DomainException('Enter a positive reconciliation quantity.');
        }

        return ['kind' => $data['kind'], 'actual_on' => $date, 'allocations' => $entries,
            'fingerprint' => $this->bulk->hash([$dispatch->id, $dispatch->version, $data['kind'], $date, $entries])];
    }

    private function batchOrder(StockReceiptLine $batch): string
    {
        return ($batch->expires_on?->toDateString() ?? '9999-12-31').'|'.$batch->receipt->received_on->toDateString().'|'.$batch->id;
    }
}
