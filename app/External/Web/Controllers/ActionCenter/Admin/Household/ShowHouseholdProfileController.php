<?php

namespace App\External\Web\Controllers\ActionCenter\Admin\Household;

use App\Core\ActionCenter\Enums\CivilStatus;
use App\Core\ActionCenter\Enums\EducationalAttainment;
use App\Core\ActionCenter\Enums\HeadDepartureDisposition;
use App\Core\ActionCenter\Enums\Relationship;
use App\Core\ActionCenter\Models\Religion;
use App\Core\ActionCenter\UseCase\Household\GetHouseholdProfileAction;
use App\External\Api\Resources\ActionCenter\Household\HouseholdMemberDetailsResource;
use App\External\Api\Resources\ActionCenter\Household\HouseholdProfileResource;
use App\External\Api\Resources\ActionCenter\HouseholdAssistanceHistoryResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

final class ShowHouseholdProfileController extends Controller
{
    public function __construct(
        private readonly GetHouseholdProfileAction $getProfile,
    ) {}

    public function __invoke(string $municipality, string $householdId): Response
    {
        $data = $this->getProfile->execute(app('municipal_id'), $householdId);

        return Inertia::render('ActionCenter/Admin/Household/HouseholdProfile', [
            'household' => new HouseholdProfileResource($data['household']),
            'members' => HouseholdMemberDetailsResource::collection($data['household']->members),
            'history' => HouseholdAssistanceHistoryResource::collection($data['history']->entries),
            'historySummary' => [
                'request_count' => $data['history']->requestCount,
                'released_count' => $data['history']->releasedCount,
                'total_released_amount' => $data['history']->totalReleasedAmount,
            ],
            'summary' => $data['summary'],
            'headState' => $data['headState'],
            'religions' => Religion::active()->get(['id', 'name']),
            'civilStatus' => CivilStatus::option(),
            'educationalAttainment' => EducationalAttainment::toOptions(),
            'relationships' => Relationship::toOptions(),
            'headDispositions' => HeadDepartureDisposition::options(),
        ]);
    }
}
