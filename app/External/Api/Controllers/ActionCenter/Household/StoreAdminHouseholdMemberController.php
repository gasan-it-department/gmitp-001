<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\StoreHouseholdMemberDto;
use App\Core\ActionCenter\Models\Beneficiary;
use App\Core\ActionCenter\UseCase\Household\StoreHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\Household\AdminHouseholdMemberRequest;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "add a member to an existing household" endpoint.
 *
 * Route: POST /api/action-center/beneficiary/{beneficiaryId}/household/members
 *
 * Resolves the beneficiary's household scoped to the acting municipality (a
 * record from another tenant 404s), then reuses StoreHouseholdMemberAction —
 * the same action the intake forms use, so the per-household active-member cap
 * and head-uniqueness apply identically. Tenant via the X-Municipality-Slug
 * header.
 */
class StoreAdminHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly StoreHouseholdMemberAction $storeMember,
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
                $dto,
                isVerifiedDependent: $request->boolean('is_verified_dependent'),
            );

            return back()->with('success', 'Household member added.');
        } catch (ModelNotFoundException $e) {
            return back()->withErrors(['member' => 'Beneficiary not found in your municipality.']);
        } catch (\DomainException $e) {
            // Active-member cap hit, etc.
            return back()->withInput()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
