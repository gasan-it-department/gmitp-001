<?php

namespace App\External\Api\Controllers\ActionCenter\Household;

use App\Core\ActionCenter\Dto\Household\ChangeHouseholdHeadDto;
use App\Core\ActionCenter\Enums\HeadDepartureDisposition;
use App\Core\ActionCenter\UseCase\Household\ChangeHouseholdHeadAction;
use App\External\Api\Request\ActionCenter\Household\ChangeHouseholdHeadRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class ChangeHouseholdHeadController extends Controller
{
    public function __construct(
        private readonly ChangeHouseholdHeadAction $changeHouseholdHead,
    ) {}

    public function __invoke(
        string $householdId,
        ChangeHouseholdHeadRequest $request,
    ): RedirectResponse {
        try {
            $disposition = $request->validated('current_head_disposition');

            $this->changeHouseholdHead->execute(new ChangeHouseholdHeadDto(
                householdId: $householdId,
                municipalId: app('municipal_id'),
                actingAdminId: $request->user()->id,
                successorMemberId: $request->validated('successor_member_id'),
                currentHeadDisposition: $disposition
                    ? HeadDepartureDisposition::from($disposition)
                    : null,
                formerHeadRelationship: $request->validated('former_head_relationship'),
                reason: $request->string('reason')->trim()->toString(),
            ));

            return back()->with('success', 'Household head assignment updated.');
        } catch (AuthorizationException|\DomainException $exception) {
            return back()->withInput()->withErrors([
                'household_head' => $exception->getMessage(),
            ]);
        }
    }
}
