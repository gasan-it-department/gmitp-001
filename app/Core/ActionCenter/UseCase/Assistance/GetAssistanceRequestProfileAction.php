<?php

namespace App\Core\ActionCenter\UseCase\Assistance;

use App\Core\ActionCenter\Models\AssistanceRequest;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Spatie\Activitylog\Models\Activity;

class GetAssistanceRequestProfileAction
{
    public function execute(string $municipalId, string $assistanceRequestId)
    {
        // Eager-load every user-role relation the resource exposes via
        // whenLoaded(). Missing one here = the corresponding audit-trail
        // row silently disappears from the frontend (whenLoaded returns
        // MissingValue → JSON omits the key → React sees `undefined` →
        // `{detail.reviewed_by && ...}` short-circuits → no AuditRow).
        $assistanceRequest = AssistanceRequest::with([
            'assistanceType.documents',
            'encodedBy',
            'reviewedBy',
            'approvedBy',
            'media',
        ])->findOrFail($assistanceRequestId);

        if ($assistanceRequest->municipal_id !== $municipalId) {
            throw new ModelNotFoundException();
        }

        $recentHistory = AssistanceRequest::query()
            ->where('beneficiary_id', $assistanceRequest->beneficiary_id)
            ->where('id', '!=', $assistanceRequest->id)
            ->with('assistanceType')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get();

        // Audit trail for THIS specific request — the `=` (not `!=`) is
        // critical. With `!=` you'd get the audit log of every OTHER
        // request in the system, which is both wrong and an info leak.
        $activityLog = Activity::query()
            ->where('subject_type', 'assistance_request')
            ->where('subject_id', $assistanceRequest->id)
            ->with('causer')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return [
            'request' => $assistanceRequest,
            'recentHistory' => $recentHistory,
            'activityLog' => $activityLog,
        ];
    }
}