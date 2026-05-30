<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Models\ReportSubmission;

class GetAdminReportSubmissionDetailsAction
{
    /**
     * Fetch a single report for the admin detail view, strictly tenant-scoped.
     *
     * Uses whereKey + firstOrFail (NOT findOrFail) so the tenant scope is
     * preserved — a cross-tenant ID 404s instead of leaking record existence.
     */
    public function execute(string $municipalId, string $reportId): ReportSubmission
    {
        return ReportSubmission::query()
            ->with([
                'user:id,first_name,last_name',
                'media',
            ])
            ->where('municipal_id', $municipalId)
            ->whereKey($reportId)
            ->firstOrFail();
    }
}
