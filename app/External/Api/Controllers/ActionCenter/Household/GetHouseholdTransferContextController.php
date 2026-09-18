<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\UseCase\Household\GetHouseholdTransferContextAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class GetHouseholdTransferContextController extends Controller
{
    public function __construct(
        private readonly GetHouseholdTransferContextAction $getContext,
    ) {}

    public function __invoke(string $householdId, string $beneficiaryId): JsonResponse
    {
        try {
            return response()->json([
                'data' => $this->getContext->execute(
                    app('municipal_id'),
                    $householdId,
                    $beneficiaryId,
                ),
            ]);
        } catch (\DomainException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }
    }
}
