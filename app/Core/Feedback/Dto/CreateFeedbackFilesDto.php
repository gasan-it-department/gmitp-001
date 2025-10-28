<?php

namespace App\Core\Feedback\Dto;

class CreateFeedbackFilesDto
{
    public function __construct(
        public readonly string $id,
        public readonly string $feedbackId,
        public readonly string $cloudinaryId,
        public readonly string $originalName,
        public readonly string $fileType,
        public readonly string $mimeType,
        public readonly string $fileSize,
        public readonly string $secureUrl,
    ) {

    }
}