<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\DeclareHouseholdMemberForAssistanceAction;
use App\External\Api\Request\ActionCenter\Household\DeclareHouseholdMemberForAssistanceRequest;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberOptionResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class DeclareHouseholdMemberForAssistanceController extends Controller
{
    public function __construct(
        private readonly DeclareHouseholdMemberForAssistanceAction $declareMember,
    ) {}

    public function __invoke(DeclareHouseholdMemberForAssistanceRequest $request): JsonResponse
    {
        $beneficiary = Beneficiary::query()
            ->where('user_id', $request->user()->id)
            ->where('municipal_id', app('municipal_id'))
            ->firstOrFail();

        $member = $this->declareMember->execute(
            beneficiary: $beneficiary,
            dto: StoreHouseholdMemberDto::fromArray(
                $request->validated(),
                $beneficiary->household_id,
            ),
            actingUserId: $request->user()->id,
            municipalId: app('municipal_id'),
        );

        return response()->json([
            'data' => new HouseholdMemberOptionResource($member),
        ], 201);
    }
}
