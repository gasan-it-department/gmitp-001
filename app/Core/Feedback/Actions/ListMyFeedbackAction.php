<?php

namespace App\Core\Feedback\Actions;

use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Models\FeedbackSubmission;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ListMyFeedbackAction
{
    public function execute(string $userId, string $municipalId, FeedbackQueryDto $dto): LengthAwarePaginator
    {
        $query = FeedbackSubmission::query()
            ->with(['department:id,name', 'media'])
            ->where('municipal_id', $municipalId)
            ->where('user_id', $userId);

        if ($dto->search) {
            $term = "%{$dto->search}%";
            $query->where(function ($q) use ($term) {
                $q->where('subject', 'like', $term)
                    ->orWhere('message', 'like', $term)
                    ->orWhere('employee_name', 'like', $term);
            });
        }

        return $query
            ->orderBy($dto->orderBy, $dto->direction)
            ->paginate($dto->perPage);
    }
}
