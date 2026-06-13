<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ReviewBeneficiaryIntakeDto;
use App\Core\ActionCenter\UseCase\Beneficiary\ReviewBeneficiaryIntakeAction;
use App\External\Api\Request\ActionCenter\Beneficiary\ReviewBeneficiaryIntakeRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class ReviewBeneficiaryIntakeController extends Controller
{
    public function __construct(
        private readonly ReviewBeneficiaryIntakeAction $reviewIntake,
    ) {}

    public function __invoke(
        string $beneficiaryId,
        ReviewBeneficiaryIntakeRequest $request,
    ): RedirectResponse {
        try {
            $dto = new ReviewBeneficiaryIntakeDto(
                beneficiaryId: $beneficiaryId,
                municipalId: app('municipal_id'),
                actingAdminId: $request->user()->id,
                householdResolution: $request->string('household_resolution')->toString(),
                targetMemberId: $request->input('target_member_id'),
                householdResolutionReason: $request->input('household_resolution_reason'),
                verifiedMemberIds: $request->validated('verified_member_ids'),
                rejectedMemberIds: $request->validated('rejected_member_ids'),
            );

            $this->reviewIntake->execute($dto);

            return back()->with('success', 'Beneficiary identity and household intake verified.');
        } catch (AuthorizationException|\DomainException $e) {
            return back()->withInput()->withErrors(['intake' => $e->getMessage()]);
        }
    }
}
