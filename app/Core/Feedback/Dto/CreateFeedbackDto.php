<?php

namespace App\Core\Feedback\Dto;

class CreateFeedbackDto
{
    public function __construct(
        public readonly ?string $userId,
        public readonly ?string $senderName,
        public readonly ?string $employeeName,
        public readonly string $feedbackTarget,
        public readonly ?string $departmentId,
        public readonly ?string $rating,
        public readonly string $message,
        public readonly ?array $feedbackFiles,
        public readonly string $ipAddress,
        public readonly string $userAgent,
        public readonly ?string $id = null,

    ) {
    }
}