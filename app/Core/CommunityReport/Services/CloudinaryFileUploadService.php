<?php

namespace App\Core\CommunityReport\Services;

use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;


class CloudinaryFileUploadService
{

    protected Cloudinary $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
    }

    public function uploadFiles(UploadedFile $file): array
    {

        $result = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder' => 'community_report_files',
                'resource_type' => 'auto',
                'transformation' => [
                    'quality' => 'auto:good',
                    'fetch_format' => 'auto'
                ],
            ]
        );

        return [

            'public_id' => $result['public_id'],

            'file_url' => $result['secure_url'],

            'original_name' => $file->getClientOriginalName(),

            'mime_type' => $file->getClientMimeType(),

            'file_size' => $file->getSize(),

        ];

    }
}