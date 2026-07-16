<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Beneficiary\SearchHouseholdMembershipAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchHouseholdMembershipController extends Controller
{
    public function __construct(
        private readonly SearchHouseholdMembershipAction $searchMemberships,
    ) {}

    public function __invoke(string $beneficiaryId, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['required', 'string', 'min:2', 'max:100'],
        ]);

        $beneficiary = Beneficiary::query()
            ->where('municipal_id', app('municipal_id'))
            ->findOrFail($beneficiaryId);

        return response()->json([
            'data' => $this->searchMemberships->execute(
                $beneficiary,
                app('municipal_id'),
                $validated['q'],
            ),
        ]);
    }
}
