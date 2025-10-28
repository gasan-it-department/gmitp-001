<?php

namespace App\Core\Feedback\Rules;

use App\Core\Feedback\Dto\CreateFeedbackDto;

class ValidateDepartmentFeedback
{
    public function validate(CreateFeedbackDto $dto): void
    {
        if ($dto->feedbackTarget === 'department' && empty($dto->departmentId)) {
            throw new \InvalidArgumentException('Department ID is required');
        }

        if ($dto->feedbackTarget === 'department' && $dto->rating !== null && $dto->rating > 5) {
            throw new \InvalidArgumentException('Rating cannot exceed 5 stars.');
        }

        if ($dto->feedbackTarget === 'department' && $dto->rating < 1) {
            throw new \InvalidArgumentException('Rating must be at least 1.');
        }
    }
}