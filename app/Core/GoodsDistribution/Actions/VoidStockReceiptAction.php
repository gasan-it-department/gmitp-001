<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Enums\ReceiptStatus;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

final class VoidStockReceiptAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities) {}

    public function execute(string $municipalId, string $receiptId, string $actorId, string $reason, bool $canManage, bool $canAdjust): StockReceipt
    {
        return DB::transaction(function () use ($municipalId, $receiptId, $actorId, $reason, $canManage, $canAdjust) {
            $this->ledger->lockMunicipality($municipalId);
            $receipt = $this->ledger->receipt($municipalId, $receiptId);
            $status = ReceiptStatus::tryFrom($receipt->status);
            if ($status === null || ($status === ReceiptStatus::Posted && $receipt->posted_at === null)) {
                throw new \DomainException('This receipt has inconsistent lifecycle details. Resolve its history before voiding.');
            }
            $wasPosted = $status === ReceiptStatus::Posted || $receipt->posted_at !== null;
            if (($wasPosted && ! $canAdjust) || (! $wasPosted && ! $canManage)) {
                throw new AuthorizationException('You do not have permission to void this receipt.');
            }
            if ($status === ReceiptStatus::Voided) {
                return $receipt;
            }
            $reason = trim($reason);
            if ($reason === '') {
                throw new \DomainException('Enter a reason for voiding this receipt.');
            }
            $before = $receipt->toArray();
            $lines = $receipt->lines()->reorder('id')->lockForUpdate()->get();
            if ($status === ReceiptStatus::Posted) {
                foreach ($lines as $line) {
                    if ($this->ledger->reserved($line) > 0) {
                        throw new \DomainException('This receipt has reserved goods. Return or cancel the approved requests before voiding it.');
                    }
                    $movements = $line->movements()->with('reversal')->get();
                    if ($movements->contains(fn ($entry) => ! in_array($entry->type, ['receipt', 'opening', 'reversal'], true) && ! $entry->reversal)) {
                        throw new \DomainException('This receipt has unreversed stock changes. Review those changes before voiding.');
                    }
                    $original = $movements->first(fn ($entry) => in_array($entry->type, ['receipt', 'opening'], true));
                    if (! $original || $original->reversal || $this->ledger->balance($line) !== $this->quantities->parse($line->quantity, $line->base_unit)) {
                        throw new \DomainException('The original stock is no longer intact. This receipt cannot be voided.');
                    }
                    $this->ledger->append($line, $actorId, MovementType::Reversal, $this->quantities->format(-$this->quantities->parse($original->quantity, $line->base_unit)), 'void:'.$line->id, $reason, $receipt->reference, $original->id);
                }
            }
            $receipt->update(['status' => ReceiptStatus::Voided->value, 'voided_by_user_id' => $actorId, 'voided_at' => now(), 'void_reason' => $reason]);
            $this->ledger->audit($receipt, $actorId, 'Voided stock receipt', $before, $receipt->toArray());

            return $receipt;
        });
    }
}
