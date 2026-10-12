<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class ReverseStockAdjustmentAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(string $movementId, StockAdjustmentDto $dto): StockMovement
    {
        return DB::transaction(function () use ($movementId, $dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $original = StockMovement::query()->where('municipal_id', $dto->municipalId)->whereKey($movementId)->firstOrFail();
            $line = $this->ledger->batch($dto->municipalId, $original->stock_receipt_line_id);
            if ($original->type !== 'adjustment') {
                throw new \DomainException('Only stock adjustments can be reversed here.');
            }
            $existing = StockMovement::query()->where('municipal_id', $dto->municipalId)->where('operation_key', $dto->operationKey)->first();
            if ($existing) {
                if ($existing->type !== 'reversal' || $existing->reverses_movement_id !== $movementId || $existing->reason !== $dto->reason || $existing->reference !== $dto->reference || $existing->actor_user_id !== $dto->actorId) {
                    throw new \DomainException('This operation key was already used with different reversal details.');
                }

                return $existing;
            }
            if ($line->receipt->status !== 'posted') {
                throw new \DomainException('Only stock from a posted receipt can be adjusted.');
            }
            if ($original->reversal()->exists()) {
                throw new \DomainException('This adjustment was already reversed.');
            }
            $before = $this->ledger->balance($line);
            $quantity = -$this->quantities->parse($original->quantity, $line->base_unit, true);
            $after = $before + $quantity;
            if ($after < $this->ledger->reserved($line) || $after > StockQuantityService::MAX) {
                throw new \DomainException('Reversing this adjustment would exceed the available stock or supported quantity.');
            }
            $reversal = $this->ledger->append($line, $dto->actorId, MovementType::Reversal, $this->quantities->format($quantity), $dto->operationKey, $dto->reason, $dto->reference, $original->id);
            $this->ledger->audit($reversal, $dto->actorId, 'Reversed stock adjustment', ['balance' => $this->quantities->format($before)], ['balance' => $this->quantities->format($after), ...$reversal->toArray()]);

            return $reversal;
        });
    }
}
