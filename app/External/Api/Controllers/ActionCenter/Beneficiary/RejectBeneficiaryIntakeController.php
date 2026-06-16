<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\UseCase\Beneficiary\RejectBeneficiaryIntakeAction;
use App\External\Api\Request\ActionCenter\Beneficiary\RejectBeneficiaryIntakeRequest;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;

class RejectBeneficiaryIntakeController extends Controller
{
    public function __construct(
        private readonly RejectBeneficiaryIntakeAction $rejectIntake,
    ) {}

    public function __invoke(
        string $beneficiaryId,
        RejectBeneficiaryIntakeRequest $request,
    ): RedirectResponse {
        try {
            $this->rejectIntake->execute(
                beneficiaryId: $beneficiaryId,
                municipalId: app('municipal_id'),
                actingAdminId: $request->user()->id,
                reason: $request->validated('reason'),
            );

            return back()->with('success', 'Beneficiary intake rejected.');
        } catch (AuthorizationException|\DomainException $e) {
            return back()->withInput()->withErrors(['intake_rejection' => $e->getMessage()]);
        }
    }
}
