<?php

namespace App\External\Web\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\ReadGoodsInventoryAction;
use App\Core\GoodsDistribution\Actions\ReadBulkDispatchesAction;
use App\Core\GoodsDistribution\Actions\ReadProgramItemsAction;
use App\Core\GoodsDistribution\Dto\InventoryFiltersDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\Core\GoodsDistribution\Enums\ItemCategory;
use App\External\Api\Request\GoodsDistribution\InventoryPageRequest;
use App\External\Api\Resources\GoodsDistribution\CatalogResource;
use App\External\Api\Resources\GoodsDistribution\BulkDispatchResource;
use App\External\Api\Resources\GoodsDistribution\InventoryItemResource;
use App\External\Api\Resources\GoodsDistribution\ProgramItemResource;
use App\External\Api\Resources\GoodsDistribution\StockMovementResource;
use App\External\Api\Resources\GoodsDistribution\StockReceiptLineResource;
use App\External\Api\Resources\GoodsDistribution\StockReceiptResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ShowGoodsInventoryController extends Controller
{
    public function __invoke(InventoryPageRequest $request, ReadGoodsInventoryAction $read, ReadProgramItemsAction $catalog): Response
    {
        $municipalId = app('municipal_id');
        $filters = new InventoryFiltersDto($request->validated());
        $common = ['canManage' => $request->user()->can('goods_distribution.inventory.manage'), 'canAdjust' => $request->user()->can('goods_distribution.inventory.adjust'), 'filters' => $request->validated()];
        $common['itemCategories'] = ItemCategory::options();
        $common['canIntakeDistribution'] = $request->user()->can('goods_distribution.requests.intake');
        $common['canViewDistribution'] = $request->user()->can('goods_distribution.requests.view');
        $common['canViewBulk'] = $request->user()->can('goods_distribution.bulk_dispatches.view');
        $common['canPrepareBulk'] = $request->user()->can('goods_distribution.bulk_dispatches.prepare');
        if (! $read->schemaReady()) {
            return Inertia::render('GoodsDistribution/Inventory/Unavailable', $common);
        }
        $screen = $request->route('screen');
        $programId = $request->route('programId') ?? $filters->get('program_id');
        $program = $programId && $programId !== 'unassigned' ? $read->program($municipalId, $programId) : null;
        if ($program) {
            $filters = $filters->forProgram($program->id);
            $common['program'] = (new CatalogResource($program))->resolve();
            $common['filters'] = $filters->values;
        }
        if ($screen === 'program') {
            $tab = $filters->get('tab') ?? 'stock';
            if ($tab === 'dispatches') {
                abort_unless($common['canViewBulk'], 403);
                $bulkRead = app(ReadBulkDispatchesAction::class);
                if (! $bulkRead->schemaReady()) {
                    return Inertia::render('GoodsDistribution/BulkDispatch/Unavailable', $common);
                }

                return Inertia::render('GoodsDistribution/Inventory/ProgramDetails', [...$common, 'tab' => $tab,
                    'records' => $this->collection(BulkDispatchResource::class, $bulkRead->listing($municipalId, ['program_id' => $program->id, 'page' => $filters->get('page')])),
                    'options' => $read->options($municipalId, includeInactive: true, includeItems: false)]);
            }
            if ($tab === 'cooldown') {
                return Inertia::render('GoodsDistribution/Inventory/ProgramDetails', [...$common, 'tab' => $tab,
                    'options' => $read->options($municipalId, includeInactive: true, includeItems: false)]);
            }
            if ($tab === 'documents') {
                if (! \Illuminate\Support\Facades\Schema::hasTable('gd_program_document_requirements')) {
                    return Inertia::render('GoodsDistribution/Inventory/Unavailable', $common);
                }

                return Inertia::render('GoodsDistribution/Inventory/ProgramDetails', [...$common, 'tab' => $tab,
                    'documentSettings' => app(\App\Core\GoodsDistribution\Actions\ReadDistributionRequestsAction::class)->requirements($municipalId, $program->id),
                    'options' => $read->options($municipalId, includeInactive: true, includeItems: false)]);
            }
            [$resource, $records] = match ($tab) {
                'items' => [ProgramItemResource::class, $catalog->execute($municipalId, $program->id, $filters)],
                'receipts' => [StockReceiptResource::class, $read->receipts($municipalId, $filters)],
                'movements' => [StockMovementResource::class, $read->movements($municipalId, $filters)],
                default => [InventoryItemResource::class, $read->inventory($municipalId, $filters)],
            };

            return Inertia::render('GoodsDistribution/Inventory/ProgramDetails', [
                ...$common, 'tab' => $tab, 'records' => $this->collection($resource, $records),
                'options' => $read->options($municipalId, includeInactive: true, includeItems: false),
            ]);
        }
        if ($screen === 'catalog' || $screen === 'settings') {
            $kind = CatalogKind::from($screen === 'settings' ? ($filters->get('kind') ?? 'sources') : $request->route('catalog'));

            return Inertia::render($kind === CatalogKind::Programs ? 'GoodsDistribution/Inventory/Programs' : 'GoodsDistribution/Inventory/Catalog', [...$common, 'kind' => $kind->value, 'records' => $this->collection(CatalogResource::class, $read->catalog($municipalId, $kind, $filters))]);
        }
        if ($screen === 'receipts') {
            return Inertia::render('GoodsDistribution/Inventory/Receipts', [...$common, 'records' => $this->collection(StockReceiptResource::class, $read->receipts($municipalId, $filters))]);
        }
        if (in_array($screen, ['create', 'edit', 'receipt'], true)) {
            $receipt = $screen === 'create' ? null : $read->receipt($municipalId, $request->route('receiptId'));
            if ($screen === 'edit' && $program) {
                abort_if($receipt->lines->contains(fn ($line) => $line->program_id !== $program->id), 404);
            }
            if ($screen === 'edit' && $receipt->status !== 'draft') {
                return Inertia::render('GoodsDistribution/Inventory/ReceiptDetails', [...$common, 'receipt' => (new StockReceiptResource($receipt))->resolve()]);
            }

            return Inertia::render($screen === 'receipt' ? 'GoodsDistribution/Inventory/ReceiptDetails' : 'GoodsDistribution/Inventory/ReceiptForm', [
                ...$common, 'receipt' => $receipt ? (new StockReceiptResource($receipt))->resolve() : null,
                'options' => $screen === 'receipt' ? [] : $read->options($municipalId, includeItems: false), 'today' => today()->toDateString(),
            ]);
        }
        $options = $read->options($municipalId, includeInactive: true);
        if ($screen === 'item') {
            $data = $read->item($municipalId, $request->route('itemId'), $filters);

            return Inertia::render('GoodsDistribution/Inventory/ItemDetails', [
                ...$common, 'options' => $options, 'item' => (new InventoryItemResource($data['item']))->resolve(),
                'batches' => $this->collection(StockReceiptLineResource::class, $data['batches']), 'movements' => $this->collection(StockMovementResource::class, $data['movements']),
            ]);
        }

        return Inertia::render('GoodsDistribution/Inventory/Index', [...$common, 'options' => $options, 'records' => $this->collection(InventoryItemResource::class, $read->inventory($municipalId, $filters))]);
    }

    private function collection(string $resource, mixed $paginator): array
    {
        return $resource::collection($paginator)->response()->getData(true);
    }
}
