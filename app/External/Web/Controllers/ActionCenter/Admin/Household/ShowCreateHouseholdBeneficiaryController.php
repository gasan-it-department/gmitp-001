<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Household;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Household;
use App\Core\ActionCenter\Models\Religion;
use App\External\Api\Resources\ActionCenter\Household\HouseholdProfileResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ShowCreateHouseholdBeneficiaryController extends Controller
{
    public function __invoke(string $municipality, string $householdId): Response
    {
        $household = Household::query()
            ->where('municipal_id', app('municipal_id'))
            ->with('activeHead.beneficiary')
            ->findOrFail($householdId);

        return Inertia::render('ActionCenter/Admin/Household/CreateHouseholdBeneficiary', [
            'household' => new HouseholdProfileResource($household),
            'religions' => Religion::active()->get(['id', 'name']),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'civilStatus' => CivilStatus::option(),
            'relationships' => collect(Relationship::toOptions())
                ->reject(fn (array $option): bool => $option['value'] === Relationship::Head->value)
                ->values(),
            'submitUrl' => route('actionCenter.household.beneficiaries.store', [
                'householdId' => $household->id,
            ]),
            'duplicateMatches' => session('householdBeneficiaryDuplicateMatches', []),
        ]);
    }
}
