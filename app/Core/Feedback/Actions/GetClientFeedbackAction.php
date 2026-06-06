<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Models\FeedbackSubmission;

class GetClientFeedbackAction
{
    /**
     * Fetch a single feedback submission strictly scoped to the current
     * municipality. When a $userId is supplied, the submission must also
     * belong to that citizen — preventing cross-user reads inside the
     * same tenant.
     */
    public function execute(string $feedbackId, string $municipalId, ?string $userId = null): FeedbackSubmission
    {
        $query = FeedbackSubmission::query()
            ->with(['department:id,name', 'media'])
            ->where('municipal_id', $municipalId)
            ->whereKey($feedbackId);

        if ($userId !== null) {
            $query->where('user_id', $userId);
        }

        return $query->firstOrFail();
    }
}
