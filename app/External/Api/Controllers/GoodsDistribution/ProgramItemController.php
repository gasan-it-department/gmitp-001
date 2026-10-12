<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Actions\CreateProgramItemAction;
use App\Core\GoodsDistribution\Actions\ManageProgramItemAction;
use App\Core\GoodsDistribution\Dto\CatalogDto;
use App\Core\GoodsDistribution\Dto\ProgramItemDto;
use App\Core\GoodsDistribution\Enums\CatalogKind;
use App\External\Api\Request\GoodsDistribution\ManageProgramItemRequest;
use App\External\Api\Request\GoodsDistribution\SaveCatalogRequest;
use App\External\Api\Resources\GoodsDistribution\CatalogResource;
use App\External\Api\Resources\GoodsDistribution\ProgramItemResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class ProgramItemController extends Controller
{
    public function manage(ManageProgramItemRequest $request, ManageProgramItemAction $action): JsonResponse
    {
        $membership = $action->execute(new ProgramItemDto(app('municipal_id'), $request->user()->id, $request->route('programId'),
            $request->route('itemId') ?? $request->validated('item_id'), $request->route('itemId') ? $request->boolean('is_active') : true, $request->boolean('reactivate_global')));

        return response()->json(['data' => (new ProgramItemResource($membership))->resolve(), 'message' => 'Program catalog updated.']);
    }

    public function create(SaveCatalogRequest $request, CreateProgramItemAction $action): JsonResponse
    {
        try {
            $membership = $action->execute($request->route('programId'), new CatalogDto(app('municipal_id'), $request->user()->id, CatalogKind::Items, $request->validated()));

            return response()->json(['data' => (new CatalogResource($membership->item))->resolve(), 'message' => 'Item created and added to this program.']);
        } catch (\DomainException $exception) {
            return response()->json(['errors' => ['item' => [$exception->getMessage()]]], 422);
        }
    }
}
