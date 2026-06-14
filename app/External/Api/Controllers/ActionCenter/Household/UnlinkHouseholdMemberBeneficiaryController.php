<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\UseCase\Household\UnlinkHouseholdMemberBeneficiaryAction;
use App\External\Api\Request\ActionCenter\Household\UnlinkHouseholdMemberBeneficiaryRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class UnlinkHouseholdMemberBeneficiaryController extends Controller
{
    public function __construct(
        private readonly UnlinkHouseholdMemberBeneficiaryAction $unlinkMember,
    ) {}

    public function __invoke(
        string $memberId,
        UnlinkHouseholdMemberBeneficiaryRequest $request,
    ): RedirectResponse {
        try {
            $this->unlinkMember->execute(
                memberId: $memberId,
                reason: $request->string('reason')->toString(),
                municipalId: app('municipal_id'),
                actingAdminId: Auth::id(),
            );

            return back()->with('success', 'The beneficiary profile was unlinked from this household member.');
        } catch (\DomainException|AuthorizationException $e) {
            return back()->withErrors(['member' => $e->getMessage()]);
        }
    }
}
