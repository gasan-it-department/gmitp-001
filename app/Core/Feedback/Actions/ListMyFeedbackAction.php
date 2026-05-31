<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Models\FeedbackSubmission;

class ListMyFeedbackAction
{
    public function execute(string $userId, string $municipalId, FeedbackQueryDto $dto)
    {
        $query = FeedbackSubmission::query()
            ->with(['department:id,name', 'media'])
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId);

        return $query
            ->orderBy($dto->orderBy, $dto->direction)
            ->cursorPaginate($dto->perPage);
    }
}
