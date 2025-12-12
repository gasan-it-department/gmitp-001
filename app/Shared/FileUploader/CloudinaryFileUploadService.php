<?php

namespace App\Shared\FileUploader;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;


class CloudinaryFileUploadService
{

    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
    }

    public function uploadFiles(UploadedFile $file, string $folder): array
    {
        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder' => $folder,
                'resource_type' => 'auto',

                // --- REMOVED TRANSFORMATIONS ---
                // We removed 'transformation' => [...]
                // This ensures the PDF is stored exactly as the user uploaded it.
                // We will handle optimization in the Frontend/Resource URL generation instead.
            ]
        );

        return [

            'public_id' => $result['public_id'],

            'original_name' => $file->getClientOriginalName(),

            'mime_type' => $file->getClientMimeType(),

            'file_size' => $result['bytes'],

            'resource_type' => $result['resource_type'],

            'format' => $result['format'] ?? '',

        ];

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

