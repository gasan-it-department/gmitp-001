<?php

namespace App\Core\GoodsDistribution\Services;

use App\Core\GoodsDistribution\Models\StockReceipt;

final class ReceiptFingerprintService
{
    public function __construct(private readonly ProgramItemService $programItems) {}

    public function make(StockReceipt $receipt): string
    {
        $receipt->loadMissing(['source', 'location', 'lines.item', 'lines.program']);
        $memberships = $this->programItems->forReceipt($receipt);

        return hash('sha256', json_encode([
            $receipt->only(['id', 'kind', 'stock_source_id', 'storage_location_id', 'received_on', 'reference', 'notes']),
            $receipt->source?->only(['name', 'is_active']), $receipt->location?->only(['name', 'is_active']),
            $receipt->lines->map(fn ($line) => [
                $line->only(['id', 'line_number', 'item_id', 'program_id', 'base_unit', 'quantity', 'package_type', 'package_count', 'quantity_per_package', 'batch_reference', 'expires_on', 'notes']),
                $line->item?->only(['name', 'base_unit', 'is_active']), $line->program?->only(['name', 'is_active']),
                $line->program_id ? $memberships->get($line->program_id.':'.$line->item_id)?->only(['id', 'is_active', 'updated_at']) : null,
            ])->all(),
        ], JSON_THROW_ON_ERROR));
    }
}
