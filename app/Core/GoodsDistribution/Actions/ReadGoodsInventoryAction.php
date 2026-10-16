<?php

namespace App\Core\GoodsDistribution\Actions;

use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Enums\AllocationStatus;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Models\Item;
use App\Core\GoodsDistribution\Models\Program;
use App\Core\GoodsDistribution\Models\StockMovement;
use App\Core\GoodsDistribution\Models\StockReceipt;
use App\Core\GoodsDistribution\Models\StockReceiptLine;
use App\Core\GoodsDistribution\Models\StockSource;
use App\Core\GoodsDistribution\Models\StorageLocation;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Core\GoodsDistribution\Services\StockLedgerService;

final class ReadGoodsInventoryAction
{
    public function __construct(private readonly StockLedgerService $ledger) {}

    public function schemaReady(): bool
    {
        return Schema::hasTable('gd_stock_movements') && Schema::hasTable('gd_program_items');
    }

    public function catalog(string $municipalId, CatalogKind $kind, InventoryFiltersDto $filters): mixed
    {
        $model = $kind->model();
        $query = $model::query()->where('municipal_id', $municipalId);
        if ($kind === CatalogKind::Programs) {
            $query = $this->programQuery($municipalId);
        }
        if ($kind === CatalogKind::Items) {
            $query->withExists('receiptLines as base_unit_locked')->with('programItems.program');
        }
        if ($filters->get('search')) {
            $term = '%'.mb_strtolower($filters->get('search')).'%';
            $query->where(fn ($query) => $query->whereRaw('LOWER(name) LIKE ?', [$term])->orWhereRaw('LOWER(code) LIKE ?', [$term]));
        }
        if ($filters->get('active')) {
            $query->where('is_active', $filters->get('active') === 'active');
        }

        return $query->orderBy('name')->paginate(20)->withQueryString();
    }

    public function options(string $municipalId, bool $includeInactive = false, bool $includeItems = true): array
    {
        return [
            'items' => $includeItems ? Item::query()->where('municipal_id', $municipalId)->when(! $includeInactive, fn ($query) => $query->where('is_active', true))->orderBy('name')->get(['id', 'code', 'name', 'base_unit', 'is_active']) : [],
            'sources' => StockSource::query()->where('municipal_id', $municipalId)->when(! $includeInactive, fn ($query) => $query->where('is_active', true))->orderBy('name')->get(['id', 'code', 'name', 'source_type', 'is_active']),
            'locations' => StorageLocation::query()->where('municipal_id', $municipalId)->when(! $includeInactive, fn ($query) => $query->where('is_active', true))->orderBy('name')->get(['id', 'code', 'name', 'is_active']),
            'programs' => Program::query()->where('municipal_id', $municipalId)->when(! $includeInactive, fn ($query) => $query->where('is_active', true))->orderBy('name')->get(['id', 'code', 'name', 'is_active']),
        ];
    }

    public function receipts(string $municipalId, InventoryFiltersDto $filters): mixed
    {
        $query = StockReceipt::query()->where('municipal_id', $municipalId)->with(['source', 'location', 'lines.program', 'lines.item'])->withCount('lines');
        if ($filters->get('program_id')) {
            $query->whereHas('lines', fn ($query) => $filters->get('program_id') === 'unassigned' ? $query->whereNull('program_id') : $query->where('program_id', $filters->get('program_id')));
        }
        $this->historyFilters($query, 'received_on', $filters);
        if ($filters->get('status')) {
            $query->where('status', $filters->get('status'));
        }
        if ($filters->get('search')) {
            $term = '%'.mb_strtolower($filters->get('search')).'%';
            $query->where(fn ($query) => $query->whereRaw('LOWER(receipt_number) LIKE ?', [$term])->orWhereRaw('LOWER(source_name_snapshot) LIKE ?', [$term])->orWhereRaw('LOWER(reference) LIKE ?', [$term]));
        }

        return $query->orderByDesc('created_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    public function receipt(string $municipalId, string $id): StockReceipt
    {
        return StockReceipt::query()->where('municipal_id', $municipalId)->whereKey($id)->with([
            'source', 'location', 'lines' => fn ($query) => $this->lineTotals($query, $municipalId),
            'lines.item.programItems', 'lines.program', 'createdBy', 'postedBy', 'voidedBy',
        ])->firstOrFail();
    }

    private function programQuery(string $municipalId): \Illuminate\Database\Eloquent\Builder
    {
        $balances = DB::table('gd_stock_receipt_lines as batch')
            ->join('gd_stock_receipts as receipt', 'receipt.id', '=', 'batch.stock_receipt_id')
            ->join('gd_stock_movements as movement', 'movement.stock_receipt_line_id', '=', 'batch.id')
            ->where('batch.municipal_id', $municipalId)->where('receipt.municipal_id', $municipalId)
            ->where('movement.municipal_id', $municipalId)->whereNotNull('receipt.posted_at')
            ->select('batch.program_id', 'batch.item_id')->groupBy('batch.program_id', 'batch.item_id')->havingRaw('SUM(movement.quantity) > 0');
        $stock = DB::query()->fromSub($balances, 'balances')->whereColumn('balances.program_id', 'gd_programs.id')->selectRaw('COUNT(*)');
        $drafts = DB::table('gd_stock_receipts as receipt')->where('receipt.municipal_id', $municipalId)->where('receipt.status', 'draft')
            ->whereExists(fn ($query) => $query->selectRaw('1')->from('gd_stock_receipt_lines as batch')
                ->whereColumn('batch.stock_receipt_id', 'receipt.id')->whereColumn('batch.program_id', 'gd_programs.id')->where('batch.municipal_id', $municipalId))
            ->selectRaw('COUNT(*)');

        return Program::query()->where('gd_programs.municipal_id', $municipalId)->select('gd_programs.*')
            ->selectSub($stock, 'items_in_stock')->selectSub($drafts, 'draft_receipts_count')
            ->withCasts(['items_in_stock' => 'integer', 'draft_receipts_count' => 'integer']);
    }

    public function program(string $municipalId, string $programId): Program
    {
        return $this->programQuery($municipalId)->whereKey($programId)->firstOrFail();
    }

    private function historyFilters(mixed $query, string $column, InventoryFiltersDto $filters): void
    {
        if ($filters->get('year')) {
            $query->whereYear($column, (int) $filters->get('year'));
        }
        if ($filters->get('quarter')) {
            $firstMonth = ((int) $filters->get('quarter') - 1) * 3 + 1;
            $query->whereMonth($column, '>=', $firstMonth)->whereMonth($column, '<=', $firstMonth + 2);
        }
    }

    public function movements(string $municipalId, InventoryFiltersDto $filters): mixed
    {
        $query = StockMovement::query()->where('municipal_id', $municipalId)->with(['actor', 'reversal', 'line.receipt']);
        $query->when(Schema::hasTable('gd_distribution_stock_allocations'), fn ($query) => $query->with('distributionAllocation'));
        $query->when(Schema::hasTable('gd_bulk_dispatches'), fn ($query) => $query->with(['bulkAllocation', 'bulkReconciliationLine']));
        $query->whereHas('line', function ($query) use ($municipalId, $filters) {
            $query->where('municipal_id', $municipalId);
            if ($filters->get('program_id')) {
                $filters->get('program_id') === 'unassigned' ? $query->whereNull('program_id') : $query->where('program_id', $filters->get('program_id'));
            }
            if ($filters->get('search')) {
                $term = '%'.mb_strtolower($filters->get('search')).'%';
                $query->where(fn ($query) => $query->whereRaw('LOWER(item_name_snapshot) LIKE ?', [$term])->orWhereRaw('LOWER(batch_reference) LIKE ?', [$term]));
            }
        });
        $this->historyFilters($query, 'occurred_on', $filters);

        return $query->orderByDesc('posted_at')->orderByDesc('id')->paginate(20)->withQueryString();
    }

    private function filteredLines(string $municipalId, InventoryFiltersDto $filters): Builder
    {
        $query = DB::table('gd_stock_receipt_lines as batch')
            ->join('gd_stock_receipts as receipt', 'receipt.id', '=', 'batch.stock_receipt_id')
            ->where('batch.municipal_id', $municipalId)->where('receipt.municipal_id', $municipalId)->whereNotNull('receipt.posted_at');
        foreach (['source_id' => 'receipt.stock_source_id', 'location_id' => 'receipt.storage_location_id', 'program_id' => 'batch.program_id'] as $filter => $column) {
            if ($filters->get($filter)) {
                $filters->get($filter) === 'unassigned' && $filter === 'program_id' ? $query->whereNull($column) : $query->where($column, $filters->get($filter));
            }
        }
        match ($filters->get('expiry')) {
            'expired' => $query->where('batch.expires_on', '<', today()->toDateString()),
            'soon' => $query->whereBetween('batch.expires_on', [today()->toDateString(), today()->addDays(30)->toDateString()]),
            'none' => $query->whereNull('batch.expires_on'),
            default => null,
        };

        return $query;
    }

    public function inventory(string $municipalId, InventoryFiltersDto $filters, bool $paginate = true, array $itemIds = []): mixed
    {
        $balance = $this->filteredLines($municipalId, $filters)
            ->leftJoin('gd_stock_movements as movement', 'movement.stock_receipt_line_id', '=', 'batch.id')
            ->whereColumn('batch.item_id', 'gd_items.id')->selectRaw('COALESCE(SUM(movement.quantity), 0)');
        $query = Item::query()->where('gd_items.municipal_id', $municipalId)->select('gd_items.*')->selectSub($balance, 'balance');
        if ($itemIds) {
            $query->whereIn('gd_items.id', $itemIds);
        }
        $reserved = $this->filteredLines($municipalId, $filters)
            ->joinSub($this->ledger->reservationQuery($municipalId), 'held', 'held.stock_receipt_line_id', '=', 'batch.id')
            ->whereColumn('batch.item_id', 'gd_items.id')->selectRaw('COALESCE(SUM(held.quantity), 0)');
        $query->selectSub($reserved, 'reserved');
        $query->selectSub($this->allocatable($municipalId, $filters)->whereColumn('batch.item_id', 'gd_items.id'), 'available');
        foreach (['with_staff', 'reported_distributed', 'returned'] as $metric) {
            $query->selectSub($this->custodyTotals($municipalId, $filters, $metric)->whereColumn('batch.item_id', 'gd_items.id'), $metric);
        }
        if ($filters->get('include_zero') !== '1') {
            $custody = $this->custodyTotals($municipalId, $filters, 'with_staff')->whereColumn('batch.item_id', 'gd_items.id');
            $query->where(fn ($query) => $query->whereRaw('('.$balance->toSql().') > 0', $balance->getBindings())
                ->orWhereRaw('('.$custody->toSql().') > 0', $custody->getBindings()));
        }
        if ($filters->get('search')) {
            $term = '%'.mb_strtolower($filters->get('search')).'%';
            $query->where(fn ($query) => $query->whereRaw('LOWER(gd_items.name) LIKE ?', [$term])->orWhereRaw('LOWER(gd_items.code) LIKE ?', [$term]));
        }
        if ($filters->get('source_id') || $filters->get('location_id') || $filters->get('program_id') || $filters->get('expiry')) {
            $query->whereExists($this->filteredLines($municipalId, $filters)->whereColumn('batch.item_id', 'gd_items.id')->selectRaw('1'));
        }

        $query->orderBy('gd_items.name');

        return $paginate ? $query->paginate(20)->withQueryString() : $query->get();
    }

    private function allocatable(string $municipalId, InventoryFiltersDto $filters): Builder
    {
        $physical = DB::table('gd_stock_movements')->where('municipal_id', $municipalId)
            ->select('stock_receipt_line_id')->selectRaw('SUM(quantity) as quantity')->groupBy('stock_receipt_line_id');
        $reserved = $this->ledger->reservationQuery($municipalId);

        return $this->filteredLines($municipalId, $filters)->joinSub($physical, 'physical', 'physical.stock_receipt_line_id', '=', 'batch.id')
            ->leftJoinSub($reserved, 'held', 'held.stock_receipt_line_id', '=', 'batch.id')
            ->where('receipt.status', 'posted')->whereNotNull('batch.program_id')
            ->where(fn ($q) => $q->whereNull('batch.expires_on')->orWhere('batch.expires_on', '>=', today()->toDateString()))
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('gd_programs')->whereColumn('gd_programs.id', 'batch.program_id')->where('gd_programs.is_active', true))
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('gd_items')->whereColumn('gd_items.id', 'batch.item_id')->where('gd_items.is_active', true))
            ->whereExists(fn ($q) => $q->selectRaw('1')->from('gd_program_items')->whereColumn('gd_program_items.program_id', 'batch.program_id')
                ->whereColumn('gd_program_items.item_id', 'batch.item_id')->where('gd_program_items.is_active', true))
            ->selectRaw('COALESCE(SUM(physical.quantity - COALESCE(held.quantity, 0)), 0)');
    }

    private function lineTotals(mixed $query, string $municipalId): mixed
    {
        $query->withSum('movements as balance', 'quantity');
        $query->selectSub(DB::query()->fromSub($this->ledger->reservationQuery($municipalId), 'held')
            ->whereColumn('held.stock_receipt_line_id', 'gd_stock_receipt_lines.id')->selectRaw('COALESCE(SUM(held.quantity), 0)'), 'reserved');
        $query->selectSub($this->allocatable($municipalId, new InventoryFiltersDto)->whereColumn('batch.id', 'gd_stock_receipt_lines.id'), 'available');
        foreach (['with_staff', 'reported_distributed', 'returned'] as $metric) {
            $query->selectSub($this->custodyTotals($municipalId, new InventoryFiltersDto, $metric)->whereColumn('batch.id', 'gd_stock_receipt_lines.id'), $metric);
        }

        return $query;
    }

    public function item(string $municipalId, string $itemId, InventoryFiltersDto $filters): array
    {
        $item = Item::query()->where('municipal_id', $municipalId)->whereKey($itemId)->firstOrFail();
        $ids = $this->filteredLines($municipalId, $filters)->where('batch.item_id', $itemId)->select('batch.id');
        $balance = DB::table('gd_stock_movements')->where('municipal_id', $municipalId)->whereIn('stock_receipt_line_id', clone $ids)->sum('quantity');
        $item->setAttribute('balance', $balance);
        $item->setAttribute('reserved', DB::query()->fromSub($this->ledger->reservationQuery($municipalId), 'held')->whereIn('stock_receipt_line_id', clone $ids)->sum('quantity'));
        $item->setAttribute('available', $this->allocatable($municipalId, $filters)->where('batch.item_id', $itemId)->value(DB::raw('COALESCE(SUM(physical.quantity - COALESCE(held.quantity, 0)), 0)')));
        foreach (['with_staff', 'reported_distributed', 'returned'] as $metric) {
            $item->setAttribute($metric, $this->custodyTotals($municipalId, $filters, $metric)->where('batch.item_id', $itemId)->value(DB::raw('COALESCE(SUM(custody.'.$metric.'), 0)')));
        }
        $batches = $this->lineTotals(StockReceiptLine::query()->where('municipal_id', $municipalId)->whereIn('id', clone $ids)
            ->with(['receipt', 'program']), $municipalId)
            ->orderByDesc('created_at')->orderBy('id')->paginate(10, ['*'], 'batch_page')->withQueryString();
        $movements = StockMovement::query()->where('municipal_id', $municipalId)->whereIn('stock_receipt_line_id', clone $ids)
            ->with(['actor', 'reversal', 'line.receipt']);
        $movements->when(Schema::hasTable('gd_distribution_stock_allocations'), fn ($query) => $query->with('distributionAllocation'));
        $movements->when(Schema::hasTable('gd_bulk_dispatches'), fn ($query) => $query->with(['bulkAllocation', 'bulkReconciliationLine']));
        $this->historyFilters($movements, 'occurred_on', $filters);
        $movements = $movements->orderByDesc('posted_at')->orderByDesc('id')->paginate(20, ['*'], 'movement_page')->withQueryString();

        return compact('item', 'batches', 'movements');
    }

    private function custodyTotals(string $municipalId, InventoryFiltersDto $filters, string $metric): Builder
    {
        return $this->filteredLines($municipalId, $filters)
            ->joinSub($this->ledger->custodyQuery($municipalId), 'custody', 'custody.stock_receipt_line_id', '=', 'batch.id')
            ->selectRaw('COALESCE(SUM(custody.'.$metric.'), 0)');
    }
}
