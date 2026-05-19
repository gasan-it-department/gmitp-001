<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\Core\ActionCenter\UseCase\Assistance\GetAssistanceRequestProfileAction;
use App\External\Api\Resources\ActionCenter\ActivityLogResource;
use App\External\Api\Resources\ActionCenter\AssistanceRequestDetailsResource;
use App\External\Api\Resources\ActionCenter\RecentAssistanceRequestResource;
use App\External\Api\Resources\ActionCenter\RequiredDocumentResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

/**
 * Admin: show the full profile of a single assistance request.
 *
 * Route: GET /{municipality}/action-center/admin/profile/assistance-request/{assistanceRequest}
 *
 * Thin controller: it eager-loads relations, runs the tenant guard, and hands
 * the data to dedicated JsonResource classes. All payload shape decisions live
 * in those resources, NOT here.
 *
 * Tenant guard: the route-bound request must belong to the current municipality.
 * A request bound from another LGU's URL returns 404 (we deliberately do not
 * 403 — leaking "this ID exists but isn't yours" is itself an info leak).
 */
class ShowAssistanceRequestProfileController extends Controller
{
    public function __construct(
        private readonly GetAssistanceRequestProfileAction $getAssistance,
    ) {
    }

    private const ACTIVITY_LOG_LIMIT = 50;

    public function __invoke(string $municipality, string $assistanceRequestId): Response
    {
        $municipalId = app('municipal_id');

        $data = $this->getAssistance->execute($municipalId, $assistanceRequestId);

        return Inertia::render('ActionCenter/Admin/RequestDetails/AssistanceRequestsDetails', [
            'request' => new AssistanceRequestDetailsResource($data['request']),

            'requiredDocuments' => RequiredDocumentResource::collection(
                $data['request']->assistanceType->documents->sortBy(fn($doc) => $doc->pivot->sort_order ?? 0)
            ),

            'recentHistory' => RecentAssistanceRequestResource::collection($data['recentHistory']),

            'activityLog' => ActivityLogResource::collection($data['activityLog']),
        ]);
    }
}
