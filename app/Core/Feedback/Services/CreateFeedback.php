<?php
namespace App\Core\Feedback\Services;

use App\Core\Feedback\Dto\CreateFeedbackDto;
use App\Shared\Contracts\IdGeneratorInterface;
use App\Core\Feedback\Repositories\FeedbackRepositories;
use Illuminate\Support\Facades\DB;

class CreateFeedback
{
    public function __construct(
        protected IdGeneratorInterface $idGenerator,
        protected FeedbackRepositories $feedbackRepositories
    ) {
    }

    public function execute(CreateFeedbackDto $dto)
    {
        DB::beginTransaction();
        $feedbackId = $this->idGenerator->generate();


        $this->feedbackRepositories->save($dto);
    }
}