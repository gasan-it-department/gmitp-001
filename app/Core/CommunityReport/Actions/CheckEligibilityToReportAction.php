<?php

namespace App\Core\CommunityReport\Actions;

use App\Core\CommunityReport\Models\ReportSubmission;

class CheckEligibilityToReportAction
{
    private const DAILY_LIMIT = 3;

    /**
     * Check if a user is allowed to submit a new report.
     * Logic: Max 3 reports per user per municipality per day.
     */
    public function execute(string $userId, string $municipalId): bool
    {
        $count = ReportSubmission::query()
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return $count < self::DAILY_LIMIT;
    }
}
