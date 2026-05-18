<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Models\AssistanceType;
use App\Core\ActionCenter\UseCase\Assistance\ListAssistanceRequestAction;
use App\External\Api\Resources\ActionCenter\AssistanceRequestListResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin queue: lists every assistance request in the current municipality,
 * with filters for status, program, search, and date range.
 *
 * Route: GET /{municipality}/action-center/admin/list/assitance-request
 *
 * Stays thin — query construction and pagination live in
 * {@see ListAssistanceRequestAction}. This controller only validates the
 * filter inputs and shapes the Inertia payload.
 */
class ListAssistanceRequestController extends Controller
{
    /**
     * Statuses the admin queue can filter on. Mirrors the AssistanceRequest
     * workflow states — keep in sync with the model / docs.
     */
    private const ALLOWED_STATUSES = [
        'pending',
        'under_review',
        'approved',
        'released',
        'rejected',
        'cancelled',
    ];

    public function __construct(
        private readonly ListAssistanceRequestAction $listAssistanceRequestAction,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $municipalId = app('municipal_id');

        // Light validation on the filter inputs. Anything missing / invalid
        // falls back to "no filter" rather than 422 — admins shouldn't get a
        // page-level error from a stray query-string param.
        $filters = $request->validate([
            'status'             => ['nullable', Rule::in(self::ALLOWED_STATUSES)],
            'assistance_type_id' => ['nullable', 'ulid', Rule::exists('ac_assistance_types', 'id')->where('municipal_id', $municipalId)],
            'search'             => ['nullable', 'string', 'max:100'],
            'date_from'          => ['nullable', 'date'],
            'date_to'            => ['nullable', 'date', 'after_or_equal:date_from'],
            'per_page'           => ['nullable', 'integer', 'min:5', 'max:100'],
        ]);

        $assistanceRequests = $this->listAssistanceRequestAction->execute($municipalId, $filters);

        // Assistance-type dropdown for the filter bar.
        // Intentionally includes inactive types so admins can still filter
        // historical requests filed under a since-deactivated program.
        $assistanceTypes = AssistanceType::query()
            ->where('municipal_id', $municipalId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('ActionCenter/Admin/RequestList/ActionCenterRequestList', [
            // Resource collection wraps the LengthAwarePaginator → `{ data, links, meta }`.
            // The frontend reads `meta.links` for pagination and `data` for rows.
            'requests'        => AssistanceRequestListResource::collection($assistanceRequests),

            // Echoed back so React can hydrate the filter inputs on reload.
            'filters'         => $filters,

            // Dropdown options for the filter bar.
            'assistanceTypes' => $assistanceTypes,
        ]);
    }
}
