<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\StoreAdminHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\Household\AdminHouseholdMemberRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "add a member to an existing household" endpoint.
 *
 * Route: POST /api/action-center/beneficiary/{beneficiaryId}/household/members
 *
 * Resolves the beneficiary's household scoped to the acting municipality, then
 * delegates to the admin-specific Core action. Admins may save pending or
 * verified members and are not subject to the citizen declaration limit.
 */
class StoreAdminHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly StoreAdminHouseholdMemberAction $storeMember,
    ) {}

    public function __invoke(string $beneficiaryId, AdminHouseholdMemberRequest $request): RedirectResponse
    {
        try {
            $beneficiary = Beneficiary::query()
                ->whereHas('household', fn ($q) => $q->where('municipal_id', app('municipal_id')))
                ->whereKey($beneficiaryId)
                ->firstOrFail();

            $dto = StoreHouseholdMemberDto::fromArray(
                $request->validated(),
                $beneficiary->household_id,
            );

            $this->storeMember->execute(
                beneficiary: $beneficiary,
                dto: $dto,
                municipalId: app('municipal_id'),
                isVerifiedDependent: $request->boolean('is_verified_dependent'),
            );

            return back()->with('success', 'Household member added.');
        } catch (ModelNotFoundException $e) {
            return back()->withErrors(['member' => 'Beneficiary not found in your municipality.']);
        } catch (AuthorizationException|\DomainException $e) {
            // Active-member cap hit, etc.
            return back()->withInput()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
