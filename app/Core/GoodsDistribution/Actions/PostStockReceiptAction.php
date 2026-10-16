<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Enums\MovementType;
use App\Core\GoodsDistribution\Enums\ReceiptKind;
use App\Core\GoodsDistribution\Enums\ReceiptStatus;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Services\ProgramItemService;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Facades\DB;

final class PostStockReceiptAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly ReceiptFingerprintService $fingerprint, private readonly StockQuantityService $quantities, private readonly ProgramItemService $programItems) {}

    public function execute(string $municipalId, string $receiptId, string $actorId, string $fingerprint): StockReceipt
    {
        return DB::transaction(function () use ($municipalId, $receiptId, $actorId, $fingerprint) {
            $this->ledger->lockMunicipality($municipalId);
            $receipt = $this->ledger->receipt($municipalId, $receiptId);
            if ($receipt->status === ReceiptStatus::Posted->value) {
                if ($receipt->posted_at === null) {
                    throw new \DomainException('This posted receipt has no posting timestamp. Resolve its history before continuing.');
                }

                return $receipt;
            }
            if ($receipt->status !== ReceiptStatus::Draft->value) {
                throw new \DomainException('A voided receipt cannot be posted.');
            }
            $kind = ReceiptKind::tryFrom($receipt->kind);
            if ($kind === null) {
                throw new \DomainException('Select a valid receipt kind before posting.');
            }
            $receipt->lines()->reorder('id')->lockForUpdate()->get();
            $receipt->load(['source', 'location', 'lines.item', 'lines.program']);
            if (! hash_equals($this->fingerprint->make($receipt), $fingerprint)) {
                throw new \DomainException('This draft or its setup records changed. Refresh and review it before posting.');
            }
            if (! $receipt->source->is_active || ! $receipt->location->is_active || $receipt->lines->isEmpty()) {
                throw new \DomainException('Posting requires active source/storage and at least one item.');
            }
            $before = $receipt->toArray();
            foreach ($receipt->lines as $line) {
                if ($line->program_id) {
                    $this->programItems->requireEnabled($municipalId, $line->program_id, $line->item_id, 'lines.'.($line->line_number - 1).'.item_id');
                }
                if (! $line->item->is_active || ($line->program && ! $line->program->is_active) || $line->base_unit !== $line->item->base_unit) {
                    throw new \DomainException('An item or program is inactive or its unit changed. Review the draft.');
                }
                $this->quantities->assertReceiptLine($line->getAttributes(), $line->base_unit);
                $line->update(['item_name_snapshot' => $line->item->name, 'program_name_snapshot' => $line->program?->name]);
                $this->ledger->append($line, $actorId, $kind === ReceiptKind::Opening ? MovementType::Opening : MovementType::Receipt, $line->quantity, 'post:'.$line->id, occurredOn: $receipt->received_on->toDateString());
            }
            $receipt->update([
                'status' => ReceiptStatus::Posted->value, 'posted_at' => now(), 'posted_by_user_id' => $actorId,
                'source_name_snapshot' => $receipt->source->name, 'storage_location_name_snapshot' => $receipt->location->name,
            ]);
            $this->ledger->audit($receipt, $actorId, 'Posted stock receipt', $before, $receipt->fresh('lines')->toArray());

            return $receipt;
        });
    }
}
