<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Beneficiary;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Religion;
use App\Core\ActionCenter\UseCase\Beneficiary\GetBeneficiaryProfileAction;
use App\External\Api\Resources\ActionCenter\Beneficiary\BeneficiaryProfileResource;
use App\External\Api\Resources\ActionCenter\CrossMunicipalityMatchResource;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberDetailsResource;
use App\External\Api\Resources\ActionCenter\RecentAssistanceRequestResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin: show the full LIVE profile of a single beneficiary.
 *
 * Route: GET /{municipality}/action-center/admin/beneficiary/{beneficiaryId}/profile
 *
 * The review lens used before processing an assistance request — current
 * identity, household composition, and full cross-program assistance history.
 * Thin controller: the action loads + tenant-guards the data, the resources
 * shape the payload.
 */
class ShowBeneficiaryProfileController extends Controller
{
    public function __construct(
        private readonly GetBeneficiaryProfileAction $getProfile,
    ) {
    }

    public function __invoke(string $municipality, string $beneficiaryId): Response
    {
        $municipalId = app('municipal_id');

        $data = $this->getProfile->execute($municipalId, $beneficiaryId);

        return Inertia::render('ActionCenter/Admin/Beneficiary/BeneficiaryProfile', [
            'beneficiary'          => new BeneficiaryProfileResource($data['beneficiary']),
            'householdMembers'     => HouseholdMemberDetailsResource::collection($data['householdMembers']),
            'assistanceHistory'    => RecentAssistanceRequestResource::collection($data['assistanceHistory']),
            'householdTotalIncome' => $data['householdTotalIncome'],
            'crossMunicipalityMatches' => CrossMunicipalityMatchResource::collection($data['crossMunicipalityMatches']),
            'summary'              => $data['summary'],
            // Dropdown sources for the inline roster manager (add / edit member).
            'religions'             => Religion::active()->get(['id', 'name']),
            'civilStatus'           => CivilStatus::option(),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'relationships'         => Relationship::toOptions(),
        ]);
    }
}
