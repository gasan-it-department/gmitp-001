<?php

namespace App\Core\Feedback\Applications\Dto;

class CreateFeedbackDto
{
    public function __construct(
        public readonly ?string $userId,
        public readonly ?string $contactNumber,
        public readonly ?string $email,
        public readonly ?string $name,
        public readonly string $subject,
        public readonly string $subjectType,
        public readonly ?string $departmentId,
        public readonly ?string $rating,
        public readonly string $message,
        public readonly bool $isAnonymous,
        public readonly string $ipAddress,
        public readonly string $userAgent,
    ) {
    }
}