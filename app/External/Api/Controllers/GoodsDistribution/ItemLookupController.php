<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Services\ItemDuplicateService;
use App\Core\GoodsDistribution\Services\ItemLookupService;
use App\External\Api\Request\GoodsDistribution\CheckItemRequest;
use App\External\Api\Request\GoodsDistribution\SearchItemsRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;

final class ItemLookupController extends Controller
{
    public function search(SearchItemsRequest $request, ItemLookupService $lookup): AnonymousResourceCollection
    {
        $items = $lookup->search(app('municipal_id'), $request->validated('q') ?? '', $request->validated('program_id'), (int) ($request->validated('page') ?? 1), $request->validated('catalog_scope') ?? 'program');
        $items->withPath($request->url())->appends($request->only('q', 'program_id', 'catalog_scope'));

        return JsonResource::collection($items);
    }

    public function check(CheckItemRequest $request, ItemDuplicateService $duplicates): JsonResponse
    {
        return response()->json(['data' => $duplicates->check(app('municipal_id'), $request->validated('name'), $request->validated('base_unit'), $request->validated('exclude_id'))]);
    }
}
