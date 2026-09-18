<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\SearchHouseholdBeneficiaryCandidatesDto;
use App\Core\ActionCenter\UseCase\Household\SearchHouseholdBeneficiaryCandidatesAction;
use App\External\Api\Request\ActionCenter\Household\SearchHouseholdBeneficiaryCandidatesRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

final class SearchHouseholdBeneficiaryCandidatesController extends Controller
{
    public function __construct(
        private readonly SearchHouseholdBeneficiaryCandidatesAction $searchCandidates,
    ) {}

    public function __invoke(
        string $householdId,
        SearchHouseholdBeneficiaryCandidatesRequest $request,
    ): JsonResponse {
        return response()->json([
            'data' => $this->searchCandidates->execute(
                SearchHouseholdBeneficiaryCandidatesDto::fromArray(
                    $request->validated(),
                    app('municipal_id'),
                    $householdId,
                ),
            ),
        ]);
    }
}
