<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Models\FeedbackSubmission;

class CheckEligibilityToSendFeedbackAction
{
    private const DAILY_LIMIT = 3;

    /**
     * Check if a user is allowed to send new feedback.
     * Logic: Max 3 feedbacks per user per municipality per day.
     */
    public function execute(string $userId, string $municipalId): bool
    {
        $count = FeedbackSubmission::query()
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return $count < self::DAILY_LIMIT;
    }
}
