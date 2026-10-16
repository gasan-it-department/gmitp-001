<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockReceiptLine;

final class DistributionAllocationService
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    private function lockBatches(string $municipalId, array $ids): \Illuminate\Database\Eloquent\Collection
    {
        $receiptIds = StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', $ids)->pluck('stock_receipt_id')->unique()->sort()->values();
        StockReceipt::query()->where('municipal_id', $municipalId)->whereIn('id', $receiptIds)->orderBy('id')->lockForUpdate()->get();

        return StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', $ids)->with('receipt')->orderBy('id')->lockForUpdate()->get();
    }

    public function reserve(DistributionRequest $request): void
    {
        $candidateIds = StockReceiptLine::query()->where('municipal_id', $request->municipal_id)->where('program_id', $request->program_id)
            ->whereIn('item_id', $request->lines->pluck('item_id'))->where(fn ($q) => $q->whereNull('expires_on')->orWhere('expires_on', '>=', today()->toDateString()))
            ->whereHas('receipt', fn ($q) => $q->where('status', 'posted')->where('storage_location_id', $request->storage_location_id))
            ->pluck('id')->all();
        $batches = $this->lockBatches($request->municipal_id, $candidateIds)
            ->sortBy(fn ($batch) => ($batch->expires_on?->toDateString() ?? '9999-12-31').'|'.$batch->receipt->received_on->toDateString().'|'.$batch->id);
        DistributionStockAllocation::query()->where('municipal_id', $request->municipal_id)->whereIn('stock_receipt_line_id', $candidateIds)->orderBy('id')->lockForUpdate()->get();
        foreach ($request->lines as $line) {
            if ($line->quantity === null) {
                throw new \DomainException('Complete every requested quantity before reserving stock.');
            }
            $remaining = $this->quantities->parse($line->quantity, $line->base_unit);
            if ($remaining < 1) {
                throw new \DomainException('Request quantities must be positive.');
            }
            foreach ($batches->where('item_id', $line->item_id) as $batch) {
                if ($batch->base_unit !== $line->base_unit) {
                    throw new \DomainException('Stock unit no longer matches the request.');
                }
                $available = $this->ledger->balance($batch) - $this->ledger->reserved($batch);
                $amount = min($remaining, max(0, $available));
                if ($amount === 0) {
                    continue;
                }
                DistributionStockAllocation::create([
                    'municipal_id' => $request->municipal_id, 'distribution_request_id' => $request->id,
                    'distribution_request_line_id' => $line->id, 'stock_receipt_line_id' => $batch->id,
                    'approval_revision' => $request->approval_revision, 'quantity' => $this->quantities->format($amount), 'status' => AllocationStatus::Reserved->value,
                    'base_unit' => $line->base_unit,
                ]);
                $remaining -= $amount;
                if ($remaining === 0) {
                    break;
                }
            }
            if ($remaining !== 0) {
                throw new \DomainException('Insufficient unexpired available stock for '.$line->item_name_snapshot.'.');
            }
        }
    }

    public function cancel(DistributionRequest $request): void
    {
        $ids = $request->allocations()->where('status', AllocationStatus::Reserved->value)->pluck('stock_receipt_line_id')->all();
        $this->lockBatches($request->municipal_id, $ids);
        $allocations = $request->allocations()->where('status', AllocationStatus::Reserved->value)->orderBy('id')->lockForUpdate()->get();
        foreach ($allocations as $allocation) {
            $allocation->update(['status' => AllocationStatus::Cancelled->value]);
        }
    }

    public function release(DistributionRequest $request, string $actorId, string $date, array $confirmedIds): void
    {
        $allocations = $request->allocations()->where('status', AllocationStatus::Reserved->value)->orderBy('id')->get();
        $expected = $allocations->pluck('id')->sort()->values()->all();
        sort($confirmedIds);
        if (! $expected || $expected !== $confirmedIds) {
            throw new \DomainException('Confirm every reserved batch from the current approval.');
        }
        $batches = $this->lockBatches($request->municipal_id, $allocations->pluck('stock_receipt_line_id')->all())->keyBy('id');
        $allocations = $request->allocations()->where('status', AllocationStatus::Reserved->value)->orderBy('id')->lockForUpdate()->get();
        foreach ($request->lines as $line) {
            $total = $allocations->where('distribution_request_line_id', $line->id)->reduce(fn ($sum, $a) => $sum + $this->quantities->parse($a->quantity, $line->base_unit), 0);
            if ($line->quantity === null || $total !== $this->quantities->parse($line->quantity, $line->base_unit)) {
                throw new \DomainException('Reservations do not match the approved quantities.');
            }
        }
        foreach ($allocations as $allocation) {
            $batch = $batches->get($allocation->stock_receipt_line_id);
            $line = $request->lines->firstWhere('id', $allocation->distribution_request_line_id);
            if (! $batch || $batch->receipt->status !== 'posted' || $batch->program_id !== $request->program_id
                || ! $line || $batch->item_id !== $line->item_id || $batch->base_unit !== $line->base_unit
                || $allocation->approval_revision !== $request->approval_revision
                || $batch->receipt->storage_location_id !== $request->storage_location_id
                || ($batch->expires_on && $batch->expires_on->toDateString() < $date)
                || $batch->receipt->received_on->toDateString() > $date
                || $this->ledger->balance($batch) < $this->ledger->reserved($batch)) {
                throw new \DomainException('A reserved batch is unavailable or expired. Return this request and approve valid stock again.');
            }
            $amount = $this->quantities->parse($allocation->quantity, $batch->base_unit);
            StockMovement::create([
                'municipal_id' => $request->municipal_id, 'stock_receipt_line_id' => $batch->id, 'base_unit' => $batch->base_unit,
                'type' => 'distribution', 'operation_key' => 'distribution:'.$allocation->id,
                'distribution_stock_allocation_id' => $allocation->id, 'quantity' => $this->quantities->format(-$amount),
                'occurred_on' => $date, 'posted_at' => now(), 'actor_user_id' => $actorId,
                'reference' => $request->reference, 'reason' => 'Goods handover',
            ]);
            $allocation->update(['status' => AllocationStatus::Consumed->value]);
        }
    }
}
