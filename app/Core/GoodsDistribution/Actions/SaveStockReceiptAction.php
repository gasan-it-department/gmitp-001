<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Enums\ReceiptKind;
use App\Core\GoodsDistribution\Enums\ReceiptStatus;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockSource;
use App\Core\GoodsDistribution\Models\StorageLocation;
use App\Core\GoodsDistribution\Services\DistributionReferenceService;
use App\Core\GoodsDistribution\Services\ProgramItemService;
use App\Core\GoodsDistribution\Services\ReceiptFingerprintService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use App\Core\GoodsDistribution\Services\StockQuantityService;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

final class SaveStockReceiptAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly StockQuantityService $quantities, private readonly ReceiptFingerprintService $fingerprint, private readonly ProgramItemService $programItems, private readonly DistributionReferenceService $references) {}

    public function execute(StockReceiptDto $dto): StockReceipt
    {
        $kind = is_string($dto->data['kind'] ?? null) ? ReceiptKind::tryFrom($dto->data['kind']) : null;
        if ($kind === null) {
            throw new \DomainException('Select a valid receipt kind: receipt or opening.');
        }

        return DB::transaction(function () use ($dto, $kind) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $receipt = $dto->receiptId ? $this->ledger->receipt($dto->municipalId, $dto->receiptId) : new StockReceipt;
            if ($dto->scopedProgramId !== null) {
                $this->active(Program::class, $dto->scopedProgramId, $dto->municipalId);
                if ($receipt->exists && $receipt->lines()->where(fn ($query) => $query->whereNull('program_id')->orWhere('program_id', '!=', $dto->scopedProgramId))->exists()) {
                    throw new \DomainException('All receipt lines must belong to this program. Edit mixed receipts from the general receipt workspace.');
                }
                foreach ($dto->data['lines'] as $line) {
                    if (isset($line['program_id']) && $line['program_id'] !== $dto->scopedProgramId) {
                        throw new \DomainException('All receipt lines must belong to this program.');
                    }
                }
            }
            if ($receipt->exists && $receipt->status !== ReceiptStatus::Draft->value) {
                throw new \DomainException('Only draft receipts can be edited.');
            }
            if ($receipt->exists && ! hash_equals($this->fingerprint->make($receipt), (string) ($dto->data['draft_fingerprint'] ?? ''))) {
                throw new \DomainException('This draft changed. Refresh it before saving your changes.');
            }
            $before = $receipt->exists ? $receipt->toArray() : [];
            $source = $this->active(StockSource::class, $dto->data['stock_source_id'], $dto->municipalId);
            $location = $this->active(StorageLocation::class, $dto->data['storage_location_id'], $dto->municipalId);
            if (! $receipt->exists) {
                $receipt->id = (string) Str::ulid();
                $receipt->receipt_number = $this->references->nextReceipt($dto->municipalId);
                $receipt->created_by_user_id = $dto->actorId;
                $receipt->received_by_user_id = $dto->actorId;
                $receipt->status = ReceiptStatus::Draft->value;
            }
            $receipt->fill([
                ...Arr::only($dto->data, ['received_on', 'reference', 'notes']),
                'kind' => $kind->value,
                'municipal_id' => $dto->municipalId, 'stock_source_id' => $source->id, 'storage_location_id' => $location->id,
                'source_name_snapshot' => $source->name, 'storage_location_name_snapshot' => $location->name,
            ])->save();
            $receipt->lines()->reorder('id')->lockForUpdate()->get();
            $receipt->lines()->delete();
            foreach ($dto->data['lines'] as $index => $data) {
                if ($dto->scopedProgramId !== null) {
                    $data['program_id'] = $dto->scopedProgramId;
                }
                $item = $this->active(Item::class, $data['item_id'], $dto->municipalId);
                $program = empty($data['program_id']) ? null : $this->active(Program::class, $data['program_id'], $dto->municipalId);
                if ($program) {
                    $this->programItems->requireEnabled($dto->municipalId, $program->id, $item->id, 'lines.'.$index.'.item_id');
                }
                $receipt->lines()->create([
                    ...Arr::only($data, ['batch_reference', 'expires_on', 'notes']),
                    'municipal_id' => $dto->municipalId, 'line_number' => $index + 1, 'item_id' => $item->id, 'program_id' => $program?->id,
                    'item_name_snapshot' => $item->name, 'program_name_snapshot' => $program?->name, 'base_unit' => $item->base_unit,
                    'quantity' => $this->quantities->received($data, $item->base_unit),
                    'package_type' => $data['package_type'] ?? null, 'package_count' => $data['package_count'] ?? null,
                    'quantity_per_package' => empty($data['package_type']) ? null : $this->quantities->format($this->quantities->parse((string) $data['quantity_per_package'], $item->base_unit)),
                ]);
            }
            $receipt->unsetRelations()->load(['lines.item', 'lines.program', 'source', 'location']);
            $this->ledger->audit($receipt, $dto->actorId, $before ? 'Updated draft stock receipt' : 'Created draft stock receipt', $before, $receipt->toArray());

            return $receipt;
        });
    }

    private function active(string $model, string $id, string $municipalId): mixed
    {
        $record = $model::query()->where('municipal_id', $municipalId)->whereKey($id)->where('is_active', true)->first();
        if (! $record) {
            throw new \DomainException('Select active items, sources, programs, and storage from this municipality.');
        }

        return $record;
    }
}
