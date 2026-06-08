<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Beneficiary;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Models\Religion;
use App\Core\ActionCenter\UseCase\Beneficiary\GetBeneficiaryProfileAction;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryProfileResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: render the "correct a beneficiary's profile" form (display only).
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/{beneficiaryId}/edit
 *
 * Loads the LIVE beneficiary (tenant-guarded by GetBeneficiaryProfileAction —
 * a record from another municipality returns 404) and the same dropdown
 * sources the walk-in intake uses, so the edit form can never drift from the
 * validators. The POST goes to the Api UpdateBeneficiaryProfileController.
 */
class EditBeneficiaryProfileController extends Controller
{
    public function __construct(
        private readonly GetBeneficiaryProfileAction $getProfile,
    ) {
    }

    public function __invoke(string $municipality, string $beneficiaryId): Response
    {
        $municipalId = app('municipal_id');

        $data = $this->getProfile->execute($municipalId, $beneficiaryId);

        return Inertia::render('ActionCenter/Admin/Beneficiary/EditBeneficiaryProfile', [
            'beneficiary'           => new BeneficiaryProfileResource($data['beneficiary']),
            'religions'             => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus'           => CivilStatus::option(),
            'submitUrl'             => route('actionCenter.beneficiary.update', ['beneficiaryId' => $beneficiaryId]),
        ]);
    }
}
