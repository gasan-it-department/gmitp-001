<?php

namespace App\External\Api\Controllers\ActionCenter\Beneficiary;

use App\Core\ActionCenter\Dto\Beneficiary\ResubmitBeneficiaryProfileCorrectionDto;
use App\Core\ActionCenter\UseCase\Beneficiary\ResubmitBeneficiaryProfileCorrectionAction;
use App\External\Api\Request\ActionCenter\ResubmitBeneficiaryProfileCorrectionRequest;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;

class ResubmitBeneficiaryProfileCorrectionController extends Controller
{
    public function __construct(
        private readonly ResubmitBeneficiaryProfileCorrectionAction $resubmitCorrection,
    ) {}

    public function __invoke(ResubmitBeneficiaryProfileCorrectionRequest $request): RedirectResponse
    {
        $municipality = app('current_municipality');

        try {
            $dto = ResubmitBeneficiaryProfileCorrectionDto::fromArray(
                $request->validated(),
                $request->user()->id,
                $municipality->id,
                $request->file('identity_id_front'),
                $request->file('identity_id_back'),
            );

            $this->resubmitCorrection->execute($dto);

            return redirect()
                ->route('actionCenter.index', ['municipality' => $municipality->slug])
                ->with('success', 'Profile correction submitted for MSWD review.');
        } catch (\DomainException $e) {
            return back()->withInput()->withErrors(['profile_correction' => $e->getMessage()]);
        }
    }
}
