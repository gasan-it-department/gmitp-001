<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetAdminReportSubmissionsAction
{
    /**
     * Paginate community reports for the given tenant, newest first.
     * Eager loads the reporter so the resource can read full_name.
     */
    public function execute(string $municipalId, int $perPage = 20): LengthAwarePaginator
    {
        return ReportSubmission::query()
            ->with('user:id,first_name,last_name')
            ->where('municipal_id', $municipalId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
