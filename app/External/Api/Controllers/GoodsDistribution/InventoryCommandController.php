<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\AdjustStockAction;
use App\Core\GoodsDistribution\Actions\ManageCatalogAction;
use App\Core\GoodsDistribution\Actions\PostStockReceiptAction;
use App\Core\GoodsDistribution\Actions\ReverseStockAdjustmentAction;
use App\Core\GoodsDistribution\Actions\SaveStockReceiptAction;
use App\Core\GoodsDistribution\Actions\VoidStockReceiptAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\StockAdjustmentDto;
use App\Core\GoodsDistribution\Dto\StockReceiptDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\External\Api\Request\GoodsDistribution\AdjustStockRequest;
use App\External\Api\Request\GoodsDistribution\PostStockReceiptRequest;
use App\External\Api\Request\GoodsDistribution\SaveCatalogRequest;
use App\External\Api\Request\GoodsDistribution\SaveStockReceiptRequest;
use App\External\Api\Request\GoodsDistribution\VoidStockReceiptRequest;
use App\External\Api\Resources\GoodsDistribution\CatalogResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class InventoryCommandController extends Controller
{
    public function saveCatalog(SaveCatalogRequest $request, ManageCatalogAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new CatalogDto(app('municipal_id'), $request->user()->id, CatalogKind::from($request->route('catalog')), $request->validated(), $request->route('recordId'))), true);
    }

    public function saveReceipt(SaveStockReceiptRequest $request, SaveStockReceiptAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(new StockReceiptDto(app('municipal_id'), $request->user()->id, $request->validated(), $request->route('receiptId'), $request->route('programId'))));
    }

    public function postReceipt(PostStockReceiptRequest $request, PostStockReceiptAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(app('municipal_id'), $request->route('receiptId'), $request->user()->id, $request->validated('draft_fingerprint')));
    }

    public function voidReceipt(VoidStockReceiptRequest $request, VoidStockReceiptAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute(app('municipal_id'), $request->route('receiptId'), $request->user()->id, trim($request->validated('reason')), $request->user()->can('goods_distribution.inventory.manage'), $request->user()->can('goods_distribution.inventory.adjust')));
    }

    public function adjust(AdjustStockRequest $request, AdjustStockAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute($request->route('lineId'), $this->adjustment($request)));
    }

    public function reverse(AdjustStockRequest $request, ReverseStockAdjustmentAction $action): JsonResponse
    {
        return $this->respond(fn () => $action->execute($request->route('movementId'), $this->adjustment($request)));
    }

    private function adjustment(AdjustStockRequest $request): StockAdjustmentDto
    {
        return new StockAdjustmentDto(app('municipal_id'), $request->user()->id, $request->validated('operation_key'), trim($request->validated('reason')), trim($request->validated('reference')), $request->validated('quantity') ?? '0', $request->validated('direction') ?? 'add');
    }

    private function respond(\Closure $operation, bool $catalog = false): JsonResponse
    {
        try {
            $record = $operation();

            return response()->json(['data' => $catalog ? (new CatalogResource($record))->resolve() : ['id' => $record->id], 'message' => 'Inventory records updated.']);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['inventory' => [$exception->getMessage()]]], 422);
        }
    }
}
