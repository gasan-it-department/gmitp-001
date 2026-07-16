<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\CreateBeneficiaryProfileDto;
use App\Core\ActionCenter\UseCase\Beneficiary\CreateBeneficiaryProfileAction;
use App\External\Api\Request\ActionCenter\StoreProfileSetupRequest;
use App\Http\Controllers\Controller;
use App\Shared\Phone\Services\PhoneFormatterService;
use Illuminate\Http\RedirectResponse;

/**
 * Handles the one-time profile setup form submission for a new portal citizen.
 *
 * Route: POST /{municipality}/action-center/profile/setup
 *
 * Sits in the Api\Controllers layer because it mutates the database
 * (creates ac_households + ac_beneficiaries in a transaction).
 *
 * Returns a redirect() so Inertia can process the response correctly.
 */
class StoreProfileSetupController extends Controller
{
    public function __construct(
        private readonly CreateBeneficiaryProfileAction $createProfile,
        private readonly PhoneFormatterService $phoneFormatter,
    ) {
    }

    public function __invoke(
        StoreProfileSetupRequest $request,
    ): RedirectResponse {
        $municipality = app('current_municipality');

        $dto = CreateBeneficiaryProfileDto::fromArray(
            $request->validated(),
            $request->user()->id,
            $municipality->id,
            $request->file('identity_id_front'),
            $request->file('identity_id_back'),
            $this->phoneFormatter,
        );

        $this->createProfile->execute($dto);

        $fallback = route('actionCenter.portal', ['municipality' => $municipality->slug]);

        return redirect(session()->pull('url.intended', $fallback))
            ->with('success', 'Profile submitted for MSWD review. You can apply after your identity is verified.');
    }
}
