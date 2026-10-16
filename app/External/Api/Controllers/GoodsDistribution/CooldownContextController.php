<?php

namespace App\External\Api\Controllers\GoodsDistribution;

use App\Core\GoodsDistribution\Models\DistributionRequest;
use App\Core\GoodsDistribution\Services\DistributionCooldownService;
use App\Core\GoodsDistribution\Services\DistributionRequestService;
use App\External\Api\Request\GoodsDistribution\CooldownContextRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class CooldownContextController extends Controller
{
    public function __invoke(CooldownContextRequest $request, DistributionCooldownService $cooldowns, DistributionRequestService $requests): JsonResponse
    {
        try {
            $municipalId = app('municipal_id');
            $date = $request->validated('actual_release_on') ?? today()->toDateString();
            $id = $request->route('requestId');
            $context = $id
                ? $cooldowns->context(DistributionRequest::query()->where('municipal_id', $municipalId)->whereKey($id)->firstOrFail(), $date)
                : $cooldowns->evaluate($municipalId, $request->validated('program_id'), $requests->snapshot($municipalId,
                    $request->validated('beneficiary_id'), $request->validated('assisted_household_member_id')), $date);

            return response()->json(['data' => $context]);
        } catch (\DomainException $exception) {
            return response()->json(['message' => $exception->getMessage(), 'errors' => ['cooldown' => [$exception->getMessage()]]], 422);
        }
    }
}
