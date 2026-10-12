<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class AdjustStockAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(string $lineId, StockAdjustmentDto $dto): StockMovement
    {
        return DB::transaction(function () use ($lineId, $dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $line = $this->ledger->batch($dto->municipalId, $lineId);
            $quantity = $this->quantities->parse($dto->quantity, $line->base_unit);
            if ($quantity < 1 || ! in_array($dto->direction, ['add', 'remove'], true)) {
                throw new \DomainException('Enter a positive adjustment quantity and select Add or Remove.');
            }
            $quantity *= $dto->direction === 'remove' ? -1 : 1;
            $existing = StockMovement::query()->where('municipal_id', $dto->municipalId)->where('operation_key', $dto->operationKey)->first();
            if ($existing) {
                if ($existing->type !== 'adjustment' || $existing->stock_receipt_line_id !== $lineId || $existing->quantity !== $this->quantities->format($quantity) || $existing->reason !== $dto->reason || $existing->reference !== $dto->reference || $existing->actor_user_id !== $dto->actorId) {
                    throw new \DomainException('This operation key was already used with different adjustment details.');
                }

                return $existing;
            }
            if ($line->receipt->status !== 'posted') {
                throw new \DomainException('Only stock from a posted receipt can be adjusted.');
            }
            $before = $this->ledger->balance($line);
            $after = $before + $quantity;
            if ($after < $this->ledger->reserved($line) || $after > StockQuantityService::MAX) {
                throw new \DomainException('This adjustment exceeds the available stock or supported quantity.');
            }
            $movement = $this->ledger->append($line, $dto->actorId, MovementType::Adjustment, $this->quantities->format($quantity), $dto->operationKey, $dto->reason, $dto->reference);
            $this->ledger->audit($movement, $dto->actorId, 'Adjusted stock', ['balance' => $this->quantities->format($before)], ['balance' => $this->quantities->format($after), ...$movement->toArray()]);

            return $movement;
        });
    }
}
