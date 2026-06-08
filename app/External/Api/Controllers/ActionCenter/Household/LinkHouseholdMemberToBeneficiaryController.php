<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\UseCase\Household\LinkHouseholdMemberToBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Household\LinkHouseholdMemberRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

/**
 * Admin "link this household member to an existing beneficiary" endpoint
 * (identity reconciliation — link, don't duplicate).
 *
 * Route: POST /api/action-center/household/members/{memberId}/link-beneficiary
 *
 * Thin controller — tenant guard, head/already-linked guards, target resolution,
 * and the audit all live in LinkHouseholdMemberToBeneficiaryAction. Tenant comes
 * from the X-Municipality-Slug header.
 */
class LinkHouseholdMemberToBeneficiaryController extends Controller
{
    public function __construct(
        private readonly LinkHouseholdMemberToBeneficiaryAction $linkMember,
    ) {
    }

    public function __invoke(string $memberId, LinkHouseholdMemberRequest $request): RedirectResponse
    {
        try {
            $this->linkMember->execute(
                memberId: $memberId,
                beneficiaryNumber: $request->string('beneficiary_number')->toString(),
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
            );

            return back()->with('success', 'Household member linked to the existing beneficiary record.');
        } catch (\DomainException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        } catch (AuthorizationException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
