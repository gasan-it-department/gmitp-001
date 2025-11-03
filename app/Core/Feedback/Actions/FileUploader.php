<?php

namespace App\Core\Feedback\Actions;

// use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Core\Feedback\Repositories\FeedbackRepositories;
use Cloudinary\Cloudinary;
use Illuminate\Http\UploadedFile;
use App\Core\Feedback\Dto\CreateFeedbackFilesDto;


class FileUploader
{
    protected Cloudinary $cloudinary;

    public function __construct(
        protected FeedbackRepositories $feedbackRepository,
    ) {
        $this->cloudinary = new Cloudinary(config('cloudinary.cloud_url'));
    }
    public function upload(UploadedFile $file, string $fileId, string $feedbackId): void
    {

        $uploadedFile = $this->cloudinary->uploadApi()->upload($file->getRealPath(), [
            'folder' => 'feedback-files',
            'public_id' => $fileId,
            'resource_type' => 'auto',
            'context' => [
                'feedback_id' => $feedbackId,
                'original_name' => $file->getClientOriginalName(),
            ],
        ]);
        // $fileFormat = $uploadedFile['resource_type'];

        $dto = new CreateFeedbackFilesDto(
            id: $fileId,
            feedbackId: $feedbackId,
            cloudinaryId: $uploadedFile['public_id'],
            originalName: $file->getClientOriginalName(),
            fileType: $file->getClientOriginalExtension(),
            mimeType: $file->getMimeType(),
            fileSize: $uploadedFile['bytes'],
            secureUrl: $uploadedFile['secure_url'],

        );
        $this->feedbackRepository->saveFile($dto);
    }

    public function delete(string $publicId)
    {
        $result = $this->cloudinary->uploadApi()->destroy($publicId, [
            'resource_type' => 'auto',
            'invalidate' => true,
        ]);
    }

    public function multiDelete()
    {

    }
}