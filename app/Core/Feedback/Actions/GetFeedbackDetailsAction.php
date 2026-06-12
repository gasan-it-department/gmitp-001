<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Models\FeedbackSubmission;

class GetFeedbackDetailsAction
{
    public function execute(string $feedbackId, string $municipalId): FeedbackSubmission
    {
        return FeedbackSubmission::query()
            ->with(['department:id,name', 'media'])
            ->where('municipal_id', $municipalId)
            ->whereKey($feedbackId)
            ->firstOrFail();
    }
}
