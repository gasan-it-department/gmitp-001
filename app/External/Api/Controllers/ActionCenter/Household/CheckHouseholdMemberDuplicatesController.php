<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\Services\HouseholdMemberDuplicateService;
use App\External\Api\Request\ActionCenter\Household\CheckHouseholdMemberDuplicatesRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class CheckHouseholdMemberDuplicatesController extends Controller
{
    public function __construct(private readonly HouseholdMemberDuplicateService $duplicates) {}

    public function __invoke(string $householdId, CheckHouseholdMemberDuplicatesRequest $request): JsonResponse
    {
        return $this->check($householdId, $request);
    }

    public function forBeneficiary(string $beneficiaryId, CheckHouseholdMemberDuplicatesRequest $request): JsonResponse
    {
        $beneficiary = Beneficiary::query()->where('municipal_id', app('municipal_id'))->findOrFail($beneficiaryId);

        return $this->check($beneficiary->household_id, $request);
    }

    private function check(string $householdId, CheckHouseholdMemberDuplicatesRequest $request): JsonResponse
    {
        return response()->json($this->duplicates->check($request->validated(), $householdId, app('municipal_id'), $request->user()->id));
    }
}
