<?php

namespace App\Shared\FileUploader\Interface;

use Illuminate\Http\UploadedFile;

interface FileUploadInterface
{
    public function uploadFiles(UploadedFile $file, string $folder, string $filename, bool $overwrite = false): array;

    public function delete(string $publicId);

}