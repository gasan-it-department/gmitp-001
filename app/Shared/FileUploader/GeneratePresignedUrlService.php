<?php

namespace App\Shared\FileUploader;

use Illuminate\Support\Facades\Storage;

class GeneratePresignedUrlService
{
    /**
     * Generate a pre-signed URL for direct-to-cloud file uploads.
     *
     * @param string $disk The storage disk (e.g., 's3', 'r2')
     * @param string $path The destination path in the bucket (e.g., 'procurements/123/file.pdf')
     * @param string $contentType The MIME type of the file being uploaded
     * @param int $expirationMinutes How long the generated URL remains valid
     * @return string
     */
    public function execute(string $disk, string $path, string $contentType, int $expirationMinutes = 15): array
    {
        return Storage::disk($disk)->temporaryUploadUrl(
            $path,
            now()->addMinutes($expirationMinutes),
            ['ContentType' => $contentType]
        );
    }
}