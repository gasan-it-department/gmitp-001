<?php

namespace App\Core\ActionCenter\Domains\Entities;

final class Document
{
    public function __construct(
        public readonly string $id,
        public readonly string $fileName,
        public readonly string $filePath,
        public readonly string $fileType,
    ) {
    }
}