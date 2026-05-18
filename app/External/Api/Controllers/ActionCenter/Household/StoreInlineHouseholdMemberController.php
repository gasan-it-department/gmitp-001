<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\CreateInlineHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\CreateInlineHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\StoreInlineHouseholdMemberRequest;
use App\External\Api\Resources\ActionCenter\HouseholdMemberOptionResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Creates a household member from the Apply form's inline "Add a new family
 * member" mini-dialog. The new member is attached to the authenticated
 * citizen's household, and the response shape matches the picker option so
 * the frontend can append it to the dropdown without an extra round-trip.
 *
 * Route: POST /api/action-center/household/members
 */
class StoreInlineHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly CreateInlineHouseholdMemberAction $createMember,
    ) {
    }

    public function __invoke(StoreInlineHouseholdMemberRequest $request): JsonResponse
    {
        $beneficiary = Beneficiary::where('user_id', $request->user()->id)
            ->firstOrFail();

        $dto = CreateInlineHouseholdMemberDto::fromArray(
            $request->validated(),
            $beneficiary->household_id,
        );

        $member = $this->createMember->execute($dto);

        return response()->json([
            'data' => new HouseholdMemberOptionResource($member),
        ], 201);
    }
}
