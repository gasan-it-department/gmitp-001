<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Models\ReportSubmission;
use Illuminate\Support\Facades\Auth;

class GetMyReportSubmissionDetailsAction
{
    public function execute(string $reportSubmission): ReportSubmission
    {
        return ReportSubmission::query()
            ->with('media')
            ->where('municipal_id', app('municipal_id'))
            ->where('user_id', Auth::id())
            ->whereKey($reportSubmission)
            ->firstOrFail();
    }
}
