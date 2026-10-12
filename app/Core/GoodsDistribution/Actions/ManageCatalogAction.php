<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Enums\ItemCategory;
use App\Core\GoodsDistribution\Enums\StockUnit;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use App\Core\GoodsDistribution\Services\CatalogCodeService;
use App\Core\GoodsDistribution\Services\ItemDuplicateService;
use App\Core\GoodsDistribution\Services\StockLedgerService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class ManageCatalogAction
{
    public function __construct(private readonly StockLedgerService $ledger, private readonly ItemDuplicateService $duplicates, private readonly CatalogCodeService $codes) {}

    public function execute(CatalogDto $dto): Model
    {
        return DB::transaction(function () use ($dto) {
            $this->ledger->lockMunicipality($dto->municipalId);
            $model = $dto->kind->model();
            $record = $dto->recordId ? $model::query()->where('municipal_id', $dto->municipalId)->whereKey($dto->recordId)->lockForUpdate()->firstOrFail() : new $model;
            $before = $record->exists ? $record->only($dto->kind->fields()) : [];
            $data = Arr::only($dto->data, $dto->kind->fields());
            $data['code'] = $record->exists ? $record->code : $this->codes->next($dto->municipalId, $dto->kind);
            $data['name'] = trim($data['name']);
            if (! $record->exists || $data['name'] !== $record->name) {
                $data['name'] = Str::upper($data['name']);
            }
            $review = [];
            if ($model::query()->where('municipal_id', $dto->municipalId)->where('code', $data['code'])->when($record->exists, fn ($query) => $query->where('id', '<>', $record->id))->exists()) {
                throw new \DomainException('That code is already used in this municipality.');
            }
            if ($dto->kind === CatalogKind::Items) {
                if (array_key_exists('category', $data)) {
                    $category = $data['category'] === '' ? null : $data['category'];
                    if ($category !== null && (! is_string($category) || ! ItemCategory::tryFrom($category)) && (! $record->exists || $category !== $record->category)) {
                        throw ValidationException::withMessages(['category' => 'Select a valid item category.']);
                    }
                    $data['category'] = $category;
                }
                if (! $record->exists || ($record->name !== $dto->data['name'] && $record->name !== $data['name']) || $record->base_unit !== $data['base_unit']) {
                    $review = $this->duplicates->validateSave($dto->municipalId, [...$dto->data, ...$data], $record->exists ? $record->id : null);
                }
                if (! StockUnit::tryFrom($data['base_unit'])) {
                    throw new \DomainException('Select kg or piece as the base unit.');
                }
                if ($record->exists && $record->base_unit !== $data['base_unit'] && StockReceiptLine::query()->where('municipal_id', $dto->municipalId)->where('item_id', $record->id)->exists()) {
                    throw new \DomainException('This item already appears in a receipt. Its base unit cannot change.');
                }
                $changed = $record->exists && collect($data)->contains(fn ($value, $key) => $record->getAttribute($key) != $value);
                if ($changed && $record->programItems()->where('municipal_id', $dto->municipalId)->exists() && ! ($dto->data['confirm_shared_change'] ?? false)) {
                    throw ValidationException::withMessages(['confirm_shared_change' => 'Confirm that this shared item change affects all connected programs.']);
                }
            }
            $record->fill([...$data, 'municipal_id' => $dto->municipalId])->save();
            $this->ledger->audit($record, $dto->actorId, $before ? 'Updated inventory setup record' : 'Created inventory setup record', $before, [...$record->only($dto->kind->fields()), ...$review]);

            return $dto->kind === CatalogKind::Items ? $record->load('programItems.program') : $record;
        });
    }
}
