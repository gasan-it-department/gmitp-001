<?php

namespace App\Shared\FileUploader;


use App\Shared\FileUploader\Interface\MediaUploadInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CloudStorageService implements MediaUploadInterface
{

    protected string $disk = 's3';
    public function uploadMedia(UploadedFile $file, string $folder, string $filename, bool $overwrite = false): array
    {
        $cleanFilename = Str::slug(pathinfo($filename, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $finalName = $overwrite ? $cleanFilename : time() . '-' . $cleanFilename;
        $path = Storage::disk($this->disk)->putFileAs(
            $folder,
            $file,
            $finalName,
            'private'
        );

        return [
            'file_path' => $path,

            'original_name' => $file->getClientOriginalName(),

            'mime_type' => $file->getClientMimeType(),

            'file_size' => $file->getSize(),

            'extension' => $file->getClientOriginalExtension(),
        ];
    }

    public function getFolderPath(string $municipalId, string $module, ?string $subFolderId = null): string
    {
        $path = "municipal-id-{$municipalId}/{$module}";

        if ($subFolderId) {
            $path .= "/{$subFolderId}";
        }

        return $path;
    }

    public function deleteMedia(string $path): bool
    {
        // For S3/R2, the "publicId" is just the file_path stored in your DB
        if (Storage::disk($this->disk)->exists($path)) {
            return Storage::disk($this->disk)->delete($path);
        }

        return false;
    }
}