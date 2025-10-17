<?php
namespace App\Core\Feedback\Applications\Services;

use App\Core\Feedback\Applications\Dto\CreateFeedbackDto;
class CreateFeedback
{
    public function __construct(
    ) {
    }

    public function execute(CreateFeedbackDto $dto)
    {
        dd($dto);
        echo "ur here";
        return $sample = 'hello';
    }
}