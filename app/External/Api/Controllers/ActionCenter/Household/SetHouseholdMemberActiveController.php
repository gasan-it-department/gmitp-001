<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\UseCase\Household\SetHouseholdMemberActiveAction;
use App\External\Api\Request\ActionCenter\Household\SetHouseholdMemberActiveRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

/**
 * Admin "moved out / moved back in" toggle for a household member.
 *
 * Route: POST /api/action-center/household/members/{memberId}/set-active
 *
 * Never deletes — the action only flips is_active (with a head-row guard and a
 * re-activation cap check). Tenant comes from the X-Municipality-Slug header.
 */
class SetHouseholdMemberActiveController extends Controller
{
    public function __construct(
        private readonly SetHouseholdMemberActiveAction $setActive,
    ) {
    }

    public function __invoke(string $memberId, SetHouseholdMemberActiveRequest $request): RedirectResponse
    {
        try {
            $isActive = $request->boolean('is_active');

            $this->setActive->execute($memberId, $isActive, app('municipal_id'));

            return back()->with(
                'success',
                $isActive ? 'Member marked as living in the household.' : 'Member marked as moved out.',
            );
        } catch (\DomainException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
