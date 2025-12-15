<?php

namespace App\Core\Feedback\Dto;

use Illuminate\Http\UploadedFile;

class CreateFeedbackDto
{
    public function __construct(
        public ?string $userId,
        public ?string $senderName,
        public ?string $employeeName,
        public string $feedbackTarget,
        public ?string $departmentId,
        public ?string $rating,
        public string $message,
        public ?array $feedbackFiles,
        public string $ipAddress,
        public string $userAgent,
        public string $municipalId,
        public ?string $id = null,

    ) {
    }
}