<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\StoreInlineHouseholdMemberRequest;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberOptionResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Creates a household member from the Apply form's inline "Add a new family
 * member" mini-dialog. The new member is attached to the authenticated
 * citizen's household, and the response shape matches the picker option so
 * the frontend can append it to the dropdown without an extra round-trip.
 *
 * Route: POST /api/action-center/household/members
 *
 * Sibling to the profile-setup household entry — both paths converge on
 * StoreHouseholdMemberAction so the per-household active-member cap and
 * activity-log audit trail apply identically.
 */
class StoreInlineHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeMember,
    ) {
    }

    public function __invoke(StoreInlineHouseholdMemberRequest $request): JsonResponse
    {
        // Resolve the beneficiary from the authenticated user — the citizen can
        // ONLY add members to their own household, scoped to THIS municipality
        // (they hold one record per LGU). Same gate as profile-setup.
        $beneficiary = Beneficiary::where('user_id', $request->user()->id)
            ->where('municipal_id', app('municipal_id'))
            ->firstOrFail();

        $dto = StoreHouseholdMemberDto::fromArray(
            $request->validated(),
            $beneficiary->household_id,
        );

        $member = $this->storeMember->execute($dto);

        return response()->json([
            'data' => new HouseholdMemberOptionResource($member),
        ], 201);
    }
}
