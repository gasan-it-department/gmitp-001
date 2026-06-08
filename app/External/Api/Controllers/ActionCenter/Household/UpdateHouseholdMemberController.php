<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\UpdateHouseholdMemberDto;
use App\Core\ActionCenter\UseCase\Household\UpdateHouseholdMemberAction;
use App\External\Api\Request\ActionCenter\Household\AdminHouseholdMemberRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "edit a household member" endpoint.
 *
 * Route: PUT /api/action-center/household/members/{memberId}
 *
 * Thin controller — tenant guard + head-row protection + the update all live in
 * UpdateHouseholdMemberAction. Tenant comes from the X-Municipality-Slug header.
 */
class UpdateHouseholdMemberController extends Controller
{
    public function __construct(
        private readonly UpdateHouseholdMemberAction $updateMember,
    ) {
    }

    public function __invoke(string $memberId, AdminHouseholdMemberRequest $request): RedirectResponse
    {
        try {
            $dto = UpdateHouseholdMemberDto::fromArray(
                $request->validated(),
                memberId: $memberId,
                municipalId: app('municipal_id'),
            );

            $this->updateMember->execute($dto);

            return back()->with('success', 'Household member updated.');
        } catch (\DomainException $e) {
            return back()->withInput()->withErrors(['member' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
