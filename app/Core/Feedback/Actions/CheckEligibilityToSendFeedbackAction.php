<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Models\FeedbackSubmission;

class CheckEligibilityToSendFeedbackAction
{
    private const DAILY_LIMIT = 3;

    public function execute(?string $userId, string $municipalId): bool
    {
        if ($userId === null) {
            return true;
        }

        $count = FeedbackSubmission::query()
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId)
            ->whereDate('created_at', now()->toDateString())
            ->count();

        return $count < self::DAILY_LIMIT;
    }
}
