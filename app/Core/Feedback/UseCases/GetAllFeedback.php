<?php

namespace App\Core\Feedback\UseCases;

use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Repositories\FeedbackRepositories;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class GetAllFeedback
{
    public function __construct(
        protected FeedbackRepositories $feedbackRepo,
    ) {
    }

    public function execute(FeedbackQueryDto $dto, string $municipalId): LengthAwarePaginator
    {

        return $this->feedbackRepo->getAll($municipalId, $dto);

    }
}