<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Models\FeedbackSubmission;

class GetAdminFeedbackAction
{
    public function execute(string $feedbackId, string $municipalId): FeedbackSubmission
    {
        return FeedbackSubmission::query()
            ->with(['department:id,name', 'media', 'user:id,name'])
            ->where('municipal_id', $municipalId)
            ->whereKey($feedbackId)
            ->firstOrFail();
    }
}
