<?php

namespace App\Core\ActionCenter\Applications\Dto;

class AssistanceDocumentUploadDto
{
    public function __construct(
        public readonly string $requestId,
        public readonly string $filename,
        public readonly string $path,
        public readonly string $type
    ) {
    }
}