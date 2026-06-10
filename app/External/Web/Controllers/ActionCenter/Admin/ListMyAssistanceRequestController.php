<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Enums\AssistanceStatus;
use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequest\AssistanceRequestListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin "My Cases" page — the personal worklist for a social worker.
 *
 * Route: GET /{municipality}/action-center/admin/list/my-assistance-requests
 *
 * Mirrors {@see ListAssistanceRequestController} but pre-injects two
 * server-side filters that CANNOT be overridden from the query string:
 *
 *   - status                = under_review
 *   - reviewed_by_user_id   = auth()->id()
 *
 * That combination is exactly the cases this admin has picked up but not
 * yet decided on. Other admins' worklists are invisible here (the All Cases
 * page is where you go to cross-check or supervise).
 *
 * Stays thin — query construction lives in ListAssistanceRequestAction, the
 * same action the All Cases controller uses. We just call it with different
 * filter inputs.
 */
class ListMyAssistanceRequestController extends Controller
{
    public function __construct(
        private readonly ListAssistanceRequestAction $listAssistanceRequestAction,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $municipalId = app('municipal_id');

        // Only filters the admin is allowed to tweak on their personal
        // worklist. status and reviewed_by_user_id are deliberately NOT
        // accepted from the query string — they're pinned server-side
        // below so an admin cannot impersonate someone else's worklist
        // by editing the URL.
        $userFilters = $request->validate([
            'assistance_type_id' => ['nullable', 'ulid', Rule::exists('ac_assistance_types', 'id')->where('municipal_id', $municipalId)],
            'search'             => ['nullable', 'string', 'max:100'],
            'date_from'          => ['nullable', 'date'],
            'date_to'            => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page'           => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        // Compose the user-tunable filters with the pinned ownership scope.
        // Pinned keys are written LAST so any sneak-through from the request
        // input would be overwritten anyway.
        $filters = array_merge($userFilters, [
            'status'              => AssistanceStatus::UnderReview->value,
            'reviewed_by_user_id' => Auth::id(),
        ]);

        $assistanceRequests = $this->listAssistanceRequestAction->execute($municipalId, $filters);

        // Same dropdown the All Cases page uses — narrowing the personal
        // worklist by program is still useful.
        $assistanceTypes = AssistanceType::query()
            ->where('municipal_id', $municipalId)
            ->orderBy('name')
            ->get(['id', 'name']);

        // Reuses the SAME React page as the All Cases controller. The
        // `viewMode` prop tells the page to show the personal-worklist
        // heading + hide the status filter dropdown.
        return Inertia::render('ActionCenter/Admin/RequestList/ActionCenterRequestList', [
            'requests'        => AssistanceRequestListResource::collection($assistanceRequests),
            // Echo back only the user-tweakable filters so the input boxes
            // hydrate correctly. The pinned ones are implicit on this page.
            'filters'         => $userFilters,
            'assistanceTypes' => $assistanceTypes,
            'viewMode'        => 'mine',
        ]);
    }
}
