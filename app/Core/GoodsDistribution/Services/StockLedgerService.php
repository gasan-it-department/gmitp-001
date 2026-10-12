<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Models\DistributionStockAllocation;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use App\Core\Municipality\Models\Municipality;
use App\Core\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

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
        if (! Schema::hasTable('gd_distribution_stock_allocations')) {
            return 0;
        }

        return $this->quantities->parse((string) DistributionStockAllocation::query()->where('municipal_id', $line->municipal_id)
            ->where('stock_receipt_line_id', $line->id)->where('status', 'reserved')->sum('quantity'), $line->base_unit);
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
        activity($record instanceof \App\Core\GoodsDistribution\Models\DistributionRequest ? 'goods-distribution' : 'goods-inventory')->performedOn($record)->causedBy(User::findOrFail($actorId))
            ->withProperties(['municipal_id' => $record->municipal_id, 'before' => $before, 'after' => $after])->log($message);
    }
}
