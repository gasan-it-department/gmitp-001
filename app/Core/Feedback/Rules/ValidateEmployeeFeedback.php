<?php

namespace App\Core\Feedback\Rules;

use App\Core\Feedback\Dto\CreateFeedbackDto;
class ValidateEmployeeFeedback
{
    public function validate(CreateFeedbackDto $dto): void
    {
        if ($dto->feedbackTarget === 'employee' && empty($dto->employeeName)) {
            throw new \InvalidArgumentException('Employee name is required when providing feedback to emplpoyee.');
        }

        if ($dto->feedbackTarget === 'employee' && $dto->rating !== null) {
            throw new \InvalidArgumentException('You cannot rate an Employee');
        }

    }
}