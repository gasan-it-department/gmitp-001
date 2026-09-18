<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\UseCase\Household\StoreAdminHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\Household\AdminHouseholdMemberRequest;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberOptionResource;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;

final class StoreHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly StoreAdminHouseholdMemberAction $storeMember,
    ) {}

    public function __invoke(
        string $householdId,
        AdminHouseholdMemberRequest $request,
    ): RedirectResponse|JsonResponse {
        try {
            $dto = StoreHouseholdMemberDto::fromArray($request->validated(), $householdId);
            $member = $this->storeMember->executeForHousehold(
                householdId: $householdId,
                dto: $dto,
                municipalId: app('municipal_id'),
                isVerifiedDependent: $request->boolean('is_verified_dependent'),
            );

            if ($request->expectsJson()) {
                return response()->json(['data' => new HouseholdMemberOptionResource($member)], 201);
            }

            return back()->with('success', 'Household member added.');
        } catch (ModelNotFoundException) {
            return $this->error($request, 'Household not found in your municipality.', 404);
        } catch (AuthorizationException|\DomainException $exception) {
            return $this->error($request, $exception->getMessage(), 422);
        }
    }

    private function error(
        AdminHouseholdMemberRequest $request,
        string $message,
        int $status,
    ): RedirectResponse|JsonResponse {
        if ($request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'errors' => ['member' => [$message]],
            ], $status);
        }

        return back()->withInput()->withErrors(['member' => $message]);
    }
}
