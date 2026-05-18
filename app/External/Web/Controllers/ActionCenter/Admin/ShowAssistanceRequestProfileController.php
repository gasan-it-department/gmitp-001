<?php

namespace App\External\Web\Controllers\ActionCenter\Admin;

use App\Core\ActionCenter\Models\AssistanceRequest;
use App\External\Api\Resources\ActionCenter\AssistanceRequestDetailsResource;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

/**
 * Admin: show the full profile of a single assistance request.
 *
 * Route: GET /{municipality}/action-center/admin/profile/assistance-request/{assistanceRequest}
 *
 * This is the reviewer's "everything you need to decide" view — the page is
 * primarily a viewer, but it also exposes status-aware action buttons that
 * post to dedicated workflow controllers (Approve, Reject, Release, etc.)
 * once those exist. Action logic does NOT live here.
 *
 * Tenant guard: the route-bound request must belong to the current municipality.
 * A request bound from another LGU's URL returns 404 (we deliberately do not
 * 403 — leaking "this ID exists but isn't yours" is itself an info leak).
 */
class ShowAssistanceRequestProfileController extends Controller
{
    /**
     * Default number of past requests to surface in the "Recent activity"
     * panel. Small enough to scan quickly, large enough to spot patterns
     * (frequent filer, blacklist context).
     */
    private const RECENT_HISTORY_LIMIT = 5;

    public function __invoke(string $municipality, AssistanceRequest $assistanceRequest): Response
    {
        $municipalId = app('municipal_id');

        abort_if(
            $assistanceRequest->municipal_id !== $municipalId,
            404,
        );

        // Eager-load everything the details resource consumes so we never N+1.
        // `assistanceType.documents` powers the required-vs-uploaded checklist.
        $assistanceRequest->load([
            'assistanceType.documents',
            'encodedBy:id,name',
            'reviewedBy:id,name',
            'approvedBy:id,name',
            'media',
        ]);

        return Inertia::render('ActionCenter/Admin/RequestDetails/AssistanceRequestsDetails', [
            // Main payload — full details of the request itself.
            'request' => new AssistanceRequestDetailsResource($assistanceRequest),

            // The catalog of documents this assistance type requires. The
            // frontend pairs this with `request.documents` to render a
            // "Required: ✅ uploaded / ❌ missing" checklist without the
            // page having to query the doc-types table on its own.
            'requiredDocuments' => $this->buildRequiredDocumentsList($assistanceRequest),

            // Past requests by this same beneficiary (excluding the current
            // one). Surfaces "frequent filer" signals to the reviewer without
            // requiring a separate page load.
            'recentHistory' => $this->buildRecentHistory($assistanceRequest),

            // Audit trail — every field change made by admins on this request
            // (status transitions, amount approvals, remarks). Sourced from
            // spatie/laravel-activitylog; empty array when nothing has been
            // edited yet (e.g. freshly submitted pending request).
            'activityLog' => $this->buildActivityLog($assistanceRequest),
        ]);
    }

    /**
     * @return array<int, array{key: string, label: string, description: ?string, is_required: bool, sort_order: int}>
     */
    private function buildRequiredDocumentsList(AssistanceRequest $assistanceRequest): array
    {
        // The `documents` relation on AssistanceType is a belongsToMany with
        // pivot columns (is_required, sort_order) on ac_assistance_type_documents.
        return $assistanceRequest->assistanceType->documents
            ->sortBy(fn($doc) => $doc->pivot->sort_order ?? 0)
            ->map(fn($doc) => [
                'key' => $doc->key,
                'label' => $doc->label,
                'description' => $doc->description,
                'is_required' => (bool) $doc->pivot->is_required,
                'sort_order' => (int) ($doc->pivot->sort_order ?? 0),
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{id: int, description: string, changes: array<string,mixed>, old: array<string,mixed>, by: ?string, at: ?string}>
     */
    private function buildActivityLog(AssistanceRequest $assistanceRequest): array
    {
        return Activity::query()
            ->where('subject_type', 'assistance_request')
            ->where('subject_id', $assistanceRequest->id)
            ->with('causer:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'description', 'properties', 'causer_id', 'causer_type', 'created_at'])
            ->map(fn (Activity $a) => [
                'id'          => $a->id,
                'description' => $a->description,
                'changes'     => $a->properties['attributes'] ?? [],
                'old'         => $a->properties['old'] ?? [],
                'by'          => $a->causer?->name,
                'at'          => $a->created_at?->toIso8601String(),
            ])
            ->all();
    }

    /**
     * @return array<int, array{id: string, transaction_number: string, status: string, program_name: ?string, amount_approved: ?float, submitted_at: ?string}>
     */
    private function buildRecentHistory(AssistanceRequest $assistanceRequest): array
    {
        return AssistanceRequest::query()
            ->where('beneficiary_id', $assistanceRequest->beneficiary_id)
            ->where('id', '!=', $assistanceRequest->id)
            ->with('assistanceType:id,name')
            ->orderByDesc('created_at')
            ->limit(self::RECENT_HISTORY_LIMIT)
            ->get([
                'id',
                'transaction_number',
                'status',
                'assistance_type_id',
                'amount_approved',
                'created_at',
            ])
            ->map(fn(AssistanceRequest $row) => [
                'id' => $row->id,
                'transaction_number' => $row->transaction_number,
                'status' => $row->status,
                'program_name' => $row->assistanceType?->name,
                'amount_approved' => $row->amount_approved !== null ? (float) $row->amount_approved : null,
                'submitted_at' => $row->created_at?->toIso8601String(),
            ])
            ->all();
    }
}
