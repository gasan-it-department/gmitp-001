<?php

namespace App\Core\Feedback\Repositories;
use App\Core\Feedback\Models\Feedback;
use App\Core\Feedback\Dto\CreateFeedbackDto;
class FeedbackRepositories
{
    public function save(CreateFeedbackDto $dto): void
    {
        $feedback = Feedback::create([
            'id' => $dto->id,
            'user_id' => $dto->userId,
            'sender_name' => $dto->senderName,
            'employee_name' => $dto->employeeName,
            'subject_type' => $dto->subjectType,
            'department_id' => $dto->departmentId,
            'rating' => $dto->rating,
            'message' => $dto->message,
            'is_anonymous' => $dto->isAnonymous,
            'ip_address' => $dto->ipAddress,
            'user_agent' => $dto->userAgent,
        ]);
    }
}