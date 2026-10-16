<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\Builder;
use Brick\Math\BigDecimal;

final class StockLedgerService
{
    public function __construct(private readonly StockQuantityService $quantities) {}

    public function lockMunicipality(string $municipalId): void
    {
        Municipality::query()->whereKey($municipalId)->lockForUpdate()->firstOrFail();
    }

    public function receipt(string $municipalId, string $id): StockReceipt
    {
        return StockReceipt::query()->where('municipal_id', $municipalId)->whereKey($id)->lockForUpdate()->firstOrFail();
    }

    public function batch(string $municipalId, string $id): StockReceiptLine
    {
        $line = StockReceiptLine::query()->where('municipal_id', $municipalId)->whereKey($id)->firstOrFail();
        $receipt = $this->receipt($municipalId, $line->stock_receipt_id);
        $line = StockReceiptLine::query()->where('municipal_id', $municipalId)->whereKey($id)->lockForUpdate()->firstOrFail();

        return $line->setRelation('receipt', $receipt);
    }

    public function balance(StockReceiptLine $line): int
    {
        return $line->movements()->get()->reduce(fn (int $sum, StockMovement $movement) => $sum + $this->quantities->parse($movement->quantity, $line->base_unit, true), 0);
    }

    public function reserved(StockReceiptLine $line): int
    {
        $quantity = DB::query()->fromSub($this->reservationQuery($line->municipal_id), 'reserved')
            ->where('stock_receipt_line_id', $line->id)->value('quantity') ?? '0';

        return $this->quantities->parse((string) BigDecimal::of((string) $quantity)->toScale(3), $line->base_unit);
    }

    public function reservationQuery(string $municipalId): Builder
    {
        $rows = DB::table('gd_stock_receipt_lines')->whereRaw('1 = 0')->selectRaw('id as stock_receipt_line_id, 0 as quantity');
        if (Schema::hasTable('gd_distribution_stock_allocations')) {
            $rows->unionAll(DB::table('gd_distribution_stock_allocations')->where('municipal_id', $municipalId)
                ->where('status', 'reserved')->select('stock_receipt_line_id', 'quantity'));
        }
        if (Schema::hasTable('gd_bulk_dispatch_stock_allocations')) {
            $rows->unionAll(DB::table('gd_bulk_dispatch_stock_allocations')->where('municipal_id', $municipalId)
                ->where('status', 'reserved')->select('stock_receipt_line_id', 'quantity'));
        }

        return DB::query()->fromSub($rows, 'reservation_rows')->select('stock_receipt_line_id')
            ->selectRaw('SUM(quantity) as quantity')->groupBy('stock_receipt_line_id');
    }

    public function custodyQuery(string $municipalId): Builder
    {
        if (! Schema::hasTable('gd_bulk_dispatch_reconciliation_lines')) {
            return DB::table('gd_stock_receipt_lines')->whereRaw('1 = 0')
                ->selectRaw('id as stock_receipt_line_id, 0 as with_staff, 0 as reported_distributed, 0 as returned');
        }
        $counts = DB::table('gd_bulk_dispatch_reconciliation_lines as detail')
            ->join('gd_bulk_dispatch_reconciliations as event', 'event.id', '=', 'detail.reconciliation_id')
            ->leftJoin('gd_bulk_dispatch_reconciliations as original', 'original.id', '=', 'event.reverses_reconciliation_id')
            ->where('detail.municipal_id', $municipalId)->where('event.municipal_id', $municipalId)
            ->select('detail.bulk_dispatch_stock_allocation_id')
            ->selectRaw("SUM(CASE WHEN COALESCE(original.kind, event.kind) = 'distribution' THEN detail.quantity ELSE 0 END) as reported_distributed")
            ->selectRaw("SUM(CASE WHEN COALESCE(original.kind, event.kind) = 'return' THEN detail.quantity ELSE 0 END) as returned")
            ->groupBy('detail.bulk_dispatch_stock_allocation_id');

        return DB::table('gd_bulk_dispatch_stock_allocations as allocation')
            ->leftJoinSub($counts, 'counts', 'counts.bulk_dispatch_stock_allocation_id', '=', 'allocation.id')
            ->where('allocation.municipal_id', $municipalId)->where('allocation.status', 'issued')
            ->select('allocation.stock_receipt_line_id')
            ->selectRaw('SUM(allocation.quantity - COALESCE(counts.reported_distributed, 0) - COALESCE(counts.returned, 0)) as with_staff')
            ->selectRaw('SUM(COALESCE(counts.reported_distributed, 0)) as reported_distributed, SUM(COALESCE(counts.returned, 0)) as returned')
            ->groupBy('allocation.stock_receipt_line_id');
    }

    public function append(StockReceiptLine $line, string $actorId, MovementType $type, string $quantity, string $operationKey, ?string $reason = null, ?string $reference = null, ?string $reversesId = null, ?string $occurredOn = null): StockMovement
    {
        return StockMovement::create([
            'municipal_id' => $line->municipal_id, 'stock_receipt_line_id' => $line->id, 'base_unit' => $line->base_unit,
            'type' => $type->value, 'quantity' => $quantity, 'operation_key' => $operationKey,
            'occurred_on' => $occurredOn ?? today()->toDateString(), 'posted_at' => now(), 'actor_user_id' => $actorId,
            'reason' => $reason, 'reference' => $reference, 'reverses_movement_id' => $reversesId,
        ]);
    }

    public function audit(Model $record, string $actorId, string $message, array $before = [], array $after = []): void
    {
        $log = match (true) {
            $record instanceof \App\Core\GoodsDistribution\Models\BulkDispatch => 'goods-bulk-dispatch',
            $record instanceof \App\Core\GoodsDistribution\Models\DistributionRequest => 'goods-distribution',
            default => 'goods-inventory',
        };
        activity($log)->performedOn($record)->causedBy(User::findOrFail($actorId))
            ->withProperties(['municipal_id' => $record->municipal_id, 'before' => $before, 'after' => $after])->log($message);
    }
}
