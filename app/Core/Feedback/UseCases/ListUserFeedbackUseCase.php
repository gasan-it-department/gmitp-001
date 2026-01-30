<?php

namespace App\Core\Feedback\UseCases;

use App\Core\Feedback\Dto\FeedbackQueryDto;
use App\Core\Feedback\Repositories\FeedbackRepositories;

class ListUserFeedbackUseCase
{

    public function __construct(

        protected FeedbackRepositories $feedbackRepo

    ) {

    }

    public function execute(string $userId, string $municipalId, FeedbackQueryDto $dto)
    {

        return $this->feedbackRepo->getByUserId($userId, $municipalId, $dto);

    }

}