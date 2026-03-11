<?php

namespace App\Shared\FileUploader;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use App\Shared\FileUploader\Interface\FileUploadInterface;


class CloudinaryFileUploadService implements FileUploadInterface
{

    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
    }

    public function uploadFiles(UploadedFile $file, string $folder, ?string $filename = null, bool $overwrite = false): array
    {

        $options = [
            'folder' => $folder,
            'resource_type' => 'auto',
            'overwrite' => $overwrite,
            // --- REMOVED TRANSFORMATIONS ---
            // We removed 'transformation' => [...]
            // This ensures the PDF is stored exactly as the user uploaded it.
            // We will handle optimization in the Frontend/Resource URL generation instead.
        ];

        if ($filename) {
            $options['public_id'] = $filename;
        }

        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            $options,
        );

        return [

            'public_id' => $result['public_id'],

            'original_name' => $file->getClientOriginalName(),

            'mime_type' => $file->getClientMimeType(),

            'file_size' => $result['bytes'],

            'resource_type' => $result['resource_type'],

            'format' => $result['format'] ?? '',

            'secure_url' => $result['secure_url'] ?? '',

        ];

    }

    public function getFolderPath(string $municipalId, string $module, ?string $subFolderId = null): string
    {
        $root = config('filesystems.disks.cloudinary.root');
        $path = "{$root}/municipal-id-{$municipalId}/{$module}";

        if ($subFolderId) {
            $path .= "/{$subFolderId}";
        }

        return $path;
    }

    public function delete(string $publicId)
    {

        $this->cloudinary->uploadApi()->destroy($publicId);

        return true;

    }

    public function deleteMultiple()
    {

    }
}

