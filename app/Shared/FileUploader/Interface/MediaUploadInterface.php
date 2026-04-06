<?php

namespace App\Shared\FileUploader\Interface;

use Illuminate\Http\UploadedFile;

interface MediaUploadInterface
{
    public function uploadMedia(UploadedFile $file, string $folder, string $filename): array;
    public function getFolderPath(string $municipalId, string $module, ?string $subFolderId = null): string;
    public function deleteMedia(string $path): bool;
}