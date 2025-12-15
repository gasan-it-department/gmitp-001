<?php

namespace App\Core\Feedback\UseCases;

use App\Core\Feedback\Repositories\FeedbackRepositories;

class GetFeedbackUseCase
{

    public function __construct(

        protected FeedbackRepositories $feedbackRepo

    ) {
    }

    public function execute(string $municipalId, string $feedbackId)
    {

        return $this->feedbackRepo->findByIdAndMunicipality($municipalId, $feedbackId);

    }

}